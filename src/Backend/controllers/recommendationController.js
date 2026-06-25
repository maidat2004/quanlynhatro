import Room from '../models/Room.js';
import RoomInteraction from '../models/RoomInteraction.js';

const parseNumber = (value) => {
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : null;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const buildRoomQuery = (params) => {
  const query = {};

  if (params.status) query.status = params.status;

  if (params.floor) {
    const floorNum = parseInt(params.floor, 10);
    if (!Number.isNaN(floorNum)) query.floor = floorNum;
  }

  if (params.minPrice || params.maxPrice) {
    query.price = {};
    const minPriceNum = parseNumber(params.minPrice);
    const maxPriceNum = parseNumber(params.maxPrice);
    if (minPriceNum !== null) query.price.$gte = minPriceNum;
    if (maxPriceNum !== null) query.price.$lte = maxPriceNum;
  }

  if (params.minArea || params.maxArea) {
    query.area = {};
    const minAreaNum = parseNumber(params.minArea);
    const maxAreaNum = parseNumber(params.maxArea);
    if (minAreaNum !== null) query.area.$gte = minAreaNum;
    if (maxAreaNum !== null) query.area.$lte = maxAreaNum;
  }

  if (params.amenities) {
    const amenitiesList = Array.isArray(params.amenities)
      ? params.amenities
      : String(params.amenities).split(',');
    const normalizedAmenities = amenitiesList.map((item) => item.trim()).filter(Boolean);
    if (normalizedAmenities.length > 0) {
      query.amenities = { $all: normalizedAmenities };
    }
  }

  if (params.district) query.district = new RegExp(escapeRegex(params.district), 'i');
  if (params.ward) query.ward = new RegExp(escapeRegex(params.ward), 'i');
  if (params.city) query.city = new RegExp(escapeRegex(params.city), 'i');

  if (params.keyword) {
    const keywordRegex = new RegExp(escapeRegex(params.keyword), 'i');
    query.$or = [
      { roomNumber: keywordRegex },
      { description: keywordRegex },
      { address: keywordRegex },
      { ward: keywordRegex },
      { district: keywordRegex },
      { city: keywordRegex }
    ];
  }

  return query;
};

const getUserPreferences = async (userId) => {
  if (!userId) return null;

  const interactions = await RoomInteraction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('room');

  if (!interactions || interactions.length === 0) return null;

  const priceValues = [];
  const areaValues = [];
  const amenityCounts = new Map();
  const districtCounts = new Map();

  interactions.forEach((interaction) => {
    const room = interaction.room;
    if (!room) return;

    if (Number.isFinite(room.price)) priceValues.push(room.price);
    if (Number.isFinite(room.area)) areaValues.push(room.area);

    (room.amenities || []).forEach((amenity) => {
      const key = amenity.toLowerCase();
      amenityCounts.set(key, (amenityCounts.get(key) || 0) + 1);
    });

    if (room.district) {
      const key = room.district.toLowerCase();
      districtCounts.set(key, (districtCounts.get(key) || 0) + 1);
    }
  });

  const average = (values) => values.reduce((sum, val) => sum + val, 0) / Math.max(values.length, 1);

  const topAmenities = [...amenityCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const topDistrict = [...districtCounts.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  return {
    avgPrice: priceValues.length ? average(priceValues) : null,
    avgArea: areaValues.length ? average(areaValues) : null,
    topAmenities,
    topDistrict
  };
};

const getPopularityMap = async (roomIds) => {
  if (!roomIds || roomIds.length === 0) return new Map();

  const popularity = await RoomInteraction.aggregate([
    { $match: { room: { $in: roomIds } } },
    {
      $group: {
        _id: '$room',
        score: {
          $sum: {
            $switch: {
              branches: [
                { case: { $eq: ['$eventType', 'favorite'] }, then: 3 },
                { case: { $eq: ['$eventType', 'contact'] }, then: 4 },
                { case: { $eq: ['$eventType', 'direction'] }, then: 2 },
                { case: { $eq: ['$eventType', 'chatbot'] }, then: 2 },
                { case: { $eq: ['$eventType', 'view'] }, then: 1 }
              ],
              default: 1
            }
          }
        }
      }
    }
  ]);

  const map = new Map();
  popularity.forEach((item) => {
    map.set(String(item._id), item.score);
  });

  return map;
};

const calculateRangeScore = (value, min, max) => {
  if (!Number.isFinite(value)) return null;

  if (Number.isFinite(min) && Number.isFinite(max) && max >= min) {
    const mid = (min + max) / 2;
    const half = Math.max((max - min) / 2, 1);
    return clamp(1 - Math.abs(value - mid) / half);
  }

  if (Number.isFinite(max)) {
    return value <= max ? clamp(1 - (max - value) / Math.max(max, 1)) : 0;
  }

  if (Number.isFinite(min)) {
    return value >= min ? clamp(1 - (value - min) / Math.max(value, min, 1)) : 0;
  }

  return null;
};

const calculatePreferenceScore = (room, preference) => {
  if (!preference) return null;

  const scores = [];
  const reasons = [];

  if (preference.avgPrice) {
    const score = clamp(1 - Math.abs(room.price - preference.avgPrice) / Math.max(preference.avgPrice, 1));
    scores.push(score);
    if (score > 0.6) reasons.push('Phù hợp mức giá bạn thường xem');
  }

  if (preference.avgArea) {
    const score = clamp(1 - Math.abs(room.area - preference.avgArea) / Math.max(preference.avgArea, 1));
    scores.push(score);
    if (score > 0.6) reasons.push('Diện tích tương tự nhu cầu');
  }

  if (preference.topAmenities?.length) {
    const amenityMatches = (room.amenities || []).filter((item) =>
      preference.topAmenities.includes(item.toLowerCase())
    );
    const score = clamp(amenityMatches.length / preference.topAmenities.length);
    scores.push(score);
    if (amenityMatches.length > 0) reasons.push(`Có tiện ích bạn quan tâm: ${amenityMatches.slice(0, 2).join(', ')}`);
  }

  if (preference.topDistrict && room.district) {
    const score = room.district.toLowerCase() === preference.topDistrict ? 1 : 0.4;
    scores.push(score);
    if (score >= 0.8) reasons.push('Khu vực bạn hay tìm');
  }

  if (!scores.length) return { score: null, reasons: [] };

  return {
    score: scores.reduce((sum, val) => sum + val, 0) / scores.length,
    reasons
  };
};

const calculateAmenityScore = (room, selectedAmenities) => {
  if (!selectedAmenities || selectedAmenities.length === 0) return null;
  const matches = (room.amenities || []).filter((amenity) =>
    selectedAmenities.includes(amenity)
  );

  return {
    score: clamp(matches.length / selectedAmenities.length),
    matches
  };
};

export const trackInteraction = async (req, res) => {
  try {
    const { roomId, eventType, meta } = req.body;

    if (!roomId || !eventType) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu roomId hoặc eventType'
      });
    }

    const payload = {
      room: roomId,
      eventType,
      meta: meta || {}
    };

    if (req.user?.id) {
      payload.user = req.user.id;
    }

    const interaction = await RoomInteraction.create(payload);

    res.json({
      success: true,
      data: interaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      amenities,
      keyword,
      district,
      ward,
      city,
      lat,
      lng,
      radius,
      limit
    } = req.query;

    const query = buildRoomQuery({
      status: req.query.status || 'available',
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      amenities,
      keyword,
      district,
      ward,
      city
    });

    const latNum = parseNumber(lat);
    const lngNum = parseNumber(lng);
    const radiusNum = parseNumber(radius);
    const limitNum = Math.min(parseInt(limit, 10) || 8, 24);

    let rooms = [];

    if (latNum !== null && lngNum !== null) {
      const geoStage = {
        $geoNear: {
          near: { type: 'Point', coordinates: [lngNum, latNum] },
          distanceField: 'distance',
          spherical: true,
          query
        }
      };

      if (radiusNum !== null && radiusNum > 0) {
        geoStage.$geoNear.maxDistance = radiusNum * 1000;
      }

      rooms = await Room.aggregate([geoStage]);
      rooms = await Room.populate(rooms, { path: 'currentTenants' });
    } else {
      rooms = await Room.find(query).populate('currentTenants');
    }

    const roomIds = rooms.map((room) => room._id);
    const popularityMap = await getPopularityMap(roomIds);
    const maxPopularity = Math.max(1, ...popularityMap.values());

    const preference = await getUserPreferences(req.user?.id);

    const selectedAmenities = amenities
      ? (Array.isArray(amenities) ? amenities : String(amenities).split(',')).map((item) => item.trim()).filter(Boolean)
      : [];

    const scoredRooms = rooms.map((room) => {
      const priceScore = calculateRangeScore(room.price, parseNumber(minPrice), parseNumber(maxPrice));
      const areaScore = calculateRangeScore(room.area, parseNumber(minArea), parseNumber(maxArea));
      const amenityScoreResult = calculateAmenityScore(room, selectedAmenities);
      const distanceScore = Number.isFinite(room.distance)
        ? clamp(1 - room.distance / Math.max((radiusNum || 5) * 1000, 1))
        : null;

      const preferenceResult = calculatePreferenceScore(room, preference);

      const popularityScoreRaw = popularityMap.get(String(room._id)) || 0;
      const popularityScore = clamp(Math.log1p(popularityScoreRaw) / Math.log1p(maxPopularity));

      const weights = {
        price: 0.22,
        area: 0.15,
        amenities: 0.2,
        distance: 0.2,
        preference: 0.13,
        popularity: 0.1
      };

      const parts = [];
      if (priceScore !== null) parts.push({ weight: weights.price, score: priceScore, reason: 'Phù hợp ngân sách' });
      if (areaScore !== null) parts.push({ weight: weights.area, score: areaScore, reason: 'Diện tích phù hợp' });
      if (amenityScoreResult) parts.push({ weight: weights.amenities, score: amenityScoreResult.score });
      if (distanceScore !== null) parts.push({ weight: weights.distance, score: distanceScore, reason: 'Gần vị trí của bạn' });
      if (preferenceResult?.score !== null) parts.push({ weight: weights.preference, score: preferenceResult.score });
      parts.push({ weight: weights.popularity, score: popularityScore, reason: 'Nhiều người quan tâm' });

      const totalWeight = parts.reduce((sum, item) => sum + item.weight, 0);
      const totalScore = parts.reduce((sum, item) => sum + item.score * item.weight, 0) / Math.max(totalWeight, 1);

      const reasons = [];
      if (priceScore !== null && priceScore > 0.6) reasons.push('Phù hợp ngân sách');
      if (areaScore !== null && areaScore > 0.6) reasons.push('Diện tích phù hợp');
      if (amenityScoreResult?.matches?.length) reasons.push(`Có tiện ích: ${amenityScoreResult.matches.slice(0, 2).join(', ')}`);
      if (distanceScore !== null && distanceScore > 0.6) reasons.push('Gần vị trí của bạn');
      if (preferenceResult?.reasons?.length) reasons.push(...preferenceResult.reasons);
      if (popularityScore > 0.6) reasons.push('Được nhiều người quan tâm');

      return {
        ...room,
        recommendationScore: Number(totalScore.toFixed(4)),
        recommendationReasons: reasons.slice(0, 3)
      };
    });

    const sortedRooms = scoredRooms
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limitNum);

    res.json({
      success: true,
      count: sortedRooms.length,
      data: sortedRooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

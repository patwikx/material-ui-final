import { PrismaClient, UserStatus, PermissionScope, PropertyType, RoomType, RoomStatus, HousekeepingStatus, ReservationStatus, ReservationSource, PaymentStatus, PaymentMethod, PaymentProvider, ServiceCategory, TaskPriority, ContentType, PublishStatus, ContentScope, MediaCategory, ImageCategory, ImageQuality, OfferType, OfferStatus, RestaurantType, EventType, EventStatus, PromoType, PromoStatus, VoucherStatus, FeedbackCategory, FeedbackSentiment, FeedbackStatus, FeedbackPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting comprehensive seed...');

  // 1. Create Website Configuration
  const websiteConfig = await prisma.websiteConfiguration.create({
    data: {
      siteName: 'Tropicana Hotels & Resorts',
      tagline: 'Experience Paradise in Every Stay',
      description: 'Premium hospitality experience across multiple locations in the Philippines',
      companyName: 'Tropicana Worldwide Corporation',
      primaryColor: '#1e40af',
      secondaryColor: '#06b6d4',
      accentColor: '#f59e0b',
      defaultMetaTitle: 'Tropicana Hotels & Resorts - Premium Hospitality Experience',
      defaultMetaDescription: 'Discover luxury accommodations and exceptional service at Tropicana Hotels & Resorts',
      primaryPhone: '+63 83 552 8888',
      primaryEmail: 'info@tropicanahotels.com',
      bookingEmail: 'reservations@tropicanahotels.com',
      supportEmail: 'support@tropicanahotels.com',
      headquarters: 'General Santos City, Philippines',
      facebookUrl: 'https://facebook.com/tropicanahotels',
      instagramUrl: 'https://instagram.com/tropicanahotels'
    }
  });

  // 2. Create System Settings
  const systemSettings = [
    { key: 'maintenance_mode', value: 'false', type: 'boolean', description: 'Enable maintenance mode', category: 'system' },
    { key: 'booking_enabled', value: 'true', type: 'boolean', description: 'Enable online booking', category: 'booking' },
    { key: 'max_booking_days', value: '365', type: 'number', description: 'Maximum advance booking days', category: 'booking' },
    { key: 'default_cancellation_hours', value: '24', type: 'number', description: 'Default cancellation notice hours', category: 'booking' },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSetting.create({
      data: setting
    });
  }

  // 3. Create Permissions
  const permissions = [
    // System Administration
    { name: 'system.admin', displayName: 'System Administration', description: 'Full system access', scope: PermissionScope.GLOBAL, module: 'system' },
    { name: 'users.manage', displayName: 'Manage Users', description: 'Create and manage users', scope: PermissionScope.GLOBAL, module: 'users' },
    { name: 'roles.manage', displayName: 'Manage Roles', description: 'Create and manage roles', scope: PermissionScope.GLOBAL, module: 'roles' },
    
    // Property Management
    { name: 'properties.manage', displayName: 'Manage Properties', description: 'Manage business units/properties', scope: PermissionScope.GLOBAL, module: 'properties' },
    { name: 'rooms.manage', displayName: 'Manage Rooms', description: 'Manage rooms and room types', scope: PermissionScope.BUSINESS_UNIT, module: 'rooms' },
    { name: 'rates.manage', displayName: 'Manage Rates', description: 'Manage room rates and pricing', scope: PermissionScope.BUSINESS_UNIT, module: 'rates' },
    
    // Reservations
    { name: 'reservations.manage', displayName: 'Manage Reservations', description: 'Create and manage reservations', scope: PermissionScope.BUSINESS_UNIT, module: 'reservations' },
    { name: 'reservations.view', displayName: 'View Reservations', description: 'View reservation details', scope: PermissionScope.BUSINESS_UNIT, module: 'reservations' },
    { name: 'checkin.manage', displayName: 'Manage Check-in/out', description: 'Process check-ins and check-outs', scope: PermissionScope.BUSINESS_UNIT, module: 'checkin' },
    
    // Guests
    { name: 'guests.manage', displayName: 'Manage Guests', description: 'Manage guest information', scope: PermissionScope.BUSINESS_UNIT, module: 'guests' },
    { name: 'guests.view', displayName: 'View Guests', description: 'View guest information', scope: PermissionScope.BUSINESS_UNIT, module: 'guests' },
    
    // Payments
    { name: 'payments.manage', displayName: 'Manage Payments', description: 'Process and manage payments', scope: PermissionScope.BUSINESS_UNIT, module: 'payments' },
    { name: 'payments.view', displayName: 'View Payments', description: 'View payment information', scope: PermissionScope.BUSINESS_UNIT, module: 'payments' },
    { name: 'payments.refund', displayName: 'Process Refunds', description: 'Process payment refunds', scope: PermissionScope.BUSINESS_UNIT, module: 'payments' },
    
    // Services
    { name: 'services.manage', displayName: 'Manage Services', description: 'Manage hotel services', scope: PermissionScope.BUSINESS_UNIT, module: 'services' },
    { name: 'housekeeping.manage', displayName: 'Manage Housekeeping', description: 'Manage housekeeping tasks', scope: PermissionScope.BUSINESS_UNIT, module: 'housekeeping' },
    { name: 'maintenance.manage', displayName: 'Manage Maintenance', description: 'Manage maintenance tasks', scope: PermissionScope.BUSINESS_UNIT, module: 'maintenance' },
    
    // Content Management
    { name: 'content.manage', displayName: 'Manage Content', description: 'Manage website content', scope: PermissionScope.GLOBAL, module: 'content' },
    { name: 'media.manage', displayName: 'Manage Media', description: 'Manage media library', scope: PermissionScope.GLOBAL, module: 'media' },
    { name: 'offers.manage', displayName: 'Manage Special Offers', description: 'Manage special offers and promotions', scope: PermissionScope.BUSINESS_UNIT, module: 'offers' },
    
    // Restaurants & Events
    { name: 'restaurants.manage', displayName: 'Manage Restaurants', description: 'Manage restaurants and menus', scope: PermissionScope.BUSINESS_UNIT, module: 'restaurants' },
    { name: 'events.manage', displayName: 'Manage Events', description: 'Manage events and activities', scope: PermissionScope.BUSINESS_UNIT, module: 'events' },
    
    // Reports & Analytics
    { name: 'reports.view', displayName: 'View Reports', description: 'Access reports and analytics', scope: PermissionScope.BUSINESS_UNIT, module: 'reports' },
    { name: 'analytics.view', displayName: 'View Analytics', description: 'Access analytics dashboard', scope: PermissionScope.BUSINESS_UNIT, module: 'analytics' }
  ];

  const createdPermissions = [];
  for (const permission of permissions) {
    const created = await prisma.permission.create({
      data: permission
    });
    createdPermissions.push(created);
  }

  // 4. Create Roles
  const roles = [
    { name: 'super_admin', displayName: 'Super Administrator', description: 'Full system access across all properties', isSystem: true },
    { name: 'property_manager', displayName: 'Property Manager', description: 'Full access to assigned properties', isSystem: false },
    { name: 'front_desk', displayName: 'Front Desk', description: 'Reservations, check-in/out, guest management', isSystem: false },
    { name: 'housekeeping_supervisor', displayName: 'Housekeeping Supervisor', description: 'Housekeeping and room management', isSystem: false },
    { name: 'maintenance_supervisor', displayName: 'Maintenance Supervisor', description: 'Maintenance and facility management', isSystem: false },
    { name: 'restaurant_manager', displayName: 'Restaurant Manager', description: 'Restaurant and dining management', isSystem: false },
    { name: 'event_coordinator', displayName: 'Event Coordinator', description: 'Event planning and coordination', isSystem: false },
    { name: 'content_manager', displayName: 'Content Manager', description: 'Website and content management', isSystem: false },
    { name: 'accountant', displayName: 'Accountant', description: 'Financial management and reporting', isSystem: false }
  ];

  const createdRoles = [];
  for (const role of roles) {
    const created = await prisma.role.create({
      data: role
    });
    createdRoles.push(created);
  }

  // 5. Create Role Permissions
  const superAdminRole = createdRoles.find(r => r.name === 'super_admin');
  
  // Super admin gets all permissions
  for (const permission of createdPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: superAdminRole!.id,
        permissionId: permission.id
      }
    });
  }

  // Property Manager permissions
  const propertyManagerRole = createdRoles.find(r => r.name === 'property_manager');
  const propertyManagerPermissions = createdPermissions.filter(p => 
    p.scope !== PermissionScope.GLOBAL || 
    ['content.manage', 'media.manage'].includes(p.name)
  );
  
  for (const permission of propertyManagerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: propertyManagerRole!.id,
        permissionId: permission.id
      }
    });
  }

  // Front Desk permissions
  const frontDeskRole = createdRoles.find(r => r.name === 'front_desk');
  const frontDeskPermissions = createdPermissions.filter(p => 
    ['reservations.manage', 'reservations.view', 'checkin.manage', 'guests.manage', 'guests.view', 'payments.manage', 'payments.view'].includes(p.name)
  );
  
  for (const permission of frontDeskPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: frontDeskRole!.id,
        permissionId: permission.id
      }
    });
  }

  // 6. Create Admin User
  const hashedPassword = await bcrypt.hash('asdasd123', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tropicanahotels.com',
      username: 'admin',
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+63 83 552 8888',
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date()
    }
  });

  // 7. Create Business Units (Hotels/Resorts)
  const businessUnits = [
    {
      name: 'anchor_hotel',
      displayName: 'Anchor Hotel',
      description: 'Premium business hotel in the heart of General Santos City',
      propertyType: PropertyType.HOTEL,
      address: '123 Magsaysay Avenue',
      city: 'General Santos City',
      state: 'South Cotabato',
      country: 'Philippines',
      postalCode: '9500',
      phone: '+63 83 552 1001',
      email: 'anchor@tropicanahotels.com',
      latitude: 6.1164,
      longitude: 125.1719,
      slug: 'anchor-hotel',
      shortDescription: 'Modern business hotel with premium amenities',
      longDescription: 'Anchor Hotel offers sophisticated accommodations perfect for business travelers and leisure guests seeking comfort and convenience in General Santos City.',
      metaTitle: 'Anchor Hotel General Santos - Premium Business Hotel',
      metaDescription: 'Experience premium accommodations at Anchor Hotel in General Santos City. Modern amenities, exceptional service, and prime location.'
    },
    {
      name: 'dolores_farm_resort',
      displayName: 'Dolores Farm Resort',
      description: 'Agritourism resort experience surrounded by nature',
      propertyType: PropertyType.RESORT,
      address: 'Dolores Valley, Brgy. Dolores',
      city: 'General Santos City',
      state: 'South Cotabato',
      country: 'Philippines',
      postalCode: '9500',
      phone: '+63 83 552 2001',
      email: 'farm@tropicanahotels.com',
      latitude: 6.0833,
      longitude: 125.2000,
      slug: 'dolores-farm-resort',
      shortDescription: 'Agritourism resort with farm-to-table experience',
      longDescription: 'Discover the beauty of sustainable agriculture while enjoying comfortable accommodations and fresh, organic cuisine at Dolores Farm Resort.',
      metaTitle: 'Dolores Farm Resort - Agritourism Experience General Santos',
      metaDescription: 'Experience sustainable agritourism at Dolores Farm Resort. Farm-to-table dining, nature activities, and eco-friendly accommodations.'
    },
    {
      name: 'dolores_lake_resort',
      displayName: 'Dolores Lake Resort',
      description: 'Lakeside resort with water activities and scenic views',
      propertyType: PropertyType.RESORT,
      address: 'Dolores Lake, Brgy. Dolores',
      city: 'General Santos City',
      state: 'South Cotabato',
      country: 'Philippines',
      postalCode: '9500',
      phone: '+63 83 552 3001',
      email: 'lake@tropicanahotels.com',
      latitude: 6.0900,
      longitude: 125.2100,
      slug: 'dolores-lake-resort',
      shortDescription: 'Lakeside resort with water sports and recreation',
      longDescription: 'Enjoy pristine lake waters, exciting water sports, and breathtaking sunset views at Dolores Lake Resort, your perfect getaway destination.',
      metaTitle: 'Dolores Lake Resort - Lakeside Paradise General Santos',
      metaDescription: 'Escape to Dolores Lake Resort for water activities, scenic lake views, and relaxing accommodations in General Santos City.'
    },
    {
      name: 'dolores_tropicana_resort',
      displayName: 'Dolores Tropicana Resort',
      description: 'Flagship tropical resort with luxury amenities',
      propertyType: PropertyType.RESORT,
      address: 'Tropicana Boulevard, Brgy. Dolores',
      city: 'General Santos City',
      state: 'South Cotabato',
      country: 'Philippines',
      postalCode: '9500',
      phone: '+63 83 552 4001',
      email: 'tropicana@tropicanahotels.com',
      latitude: 6.1000,
      longitude: 125.2200,
      slug: 'dolores-tropicana-resort',
      shortDescription: 'Luxury tropical resort with world-class amenities',
      longDescription: 'Experience ultimate luxury at our flagship Dolores Tropicana Resort, featuring world-class amenities, multiple dining options, and exceptional service.',
      metaTitle: 'Dolores Tropicana Resort - Luxury Tropical Paradise',
      metaDescription: 'Indulge in luxury at Dolores Tropicana Resort. World-class amenities, multiple dining options, and tropical paradise in General Santos City.'
    }
  ];

  const createdBusinessUnits = [];
  for (const bu of businessUnits) {
    const created = await prisma.businessUnit.create({
      data: bu
    });
    createdBusinessUnits.push(created);
  }

  // 8. Assign Admin to All Business Units with Super Admin Role
  for (const businessUnit of createdBusinessUnits) {
    await prisma.userBusinessUnitRole.create({
      data: {
        userId: adminUser.id,
        businessUnitId: businessUnit.id,
        roleId: superAdminRole!.id,
        assignedBy: adminUser.id
      }
    });
  }

  // 9. Create Departments for each Business Unit
  const departmentTypes = [
    { name: 'Front Office', description: 'Reception, reservations, and guest services' },
    { name: 'Housekeeping', description: 'Room cleaning and maintenance' },
    { name: 'Food & Beverage', description: 'Restaurant and catering services' },
    { name: 'Maintenance', description: 'Facility maintenance and repairs' },
    { name: 'Security', description: 'Property security and safety' },
    { name: 'Events', description: 'Event planning and coordination' },
    { name: 'Spa & Wellness', description: 'Spa and wellness services' }
  ];

  const createdDepartments = [];
  for (const businessUnit of createdBusinessUnits) {
    for (const dept of departmentTypes) {
      const created = await prisma.department.create({
        data: {
          businessUnitId: businessUnit.id,
          name: dept.name,
          description: dept.description,
          managerId: adminUser.id
        }
      });
      createdDepartments.push(created);
    }
  }

  // 10. Create Amenities
  const amenities = [
    // General Hotel Amenities
    { name: 'Free WiFi', description: 'Complimentary high-speed internet', category: 'Internet', icon: 'wifi' },
    { name: 'Swimming Pool', description: 'Outdoor swimming pool with pool deck', category: 'Recreation', icon: 'pool' },
    { name: 'Fitness Center', description: '24/7 fitness facility', category: 'Recreation', icon: 'fitness' },
    { name: 'Restaurant', description: 'On-site dining restaurant', category: 'Dining', icon: 'restaurant' },
    { name: 'Room Service', description: '24-hour room service', category: 'Service', icon: 'room-service', isChargeable: true },
    { name: 'Spa', description: 'Full-service spa and wellness center', category: 'Wellness', icon: 'spa', isChargeable: true },
    { name: 'Business Center', description: 'Business services and meeting facilities', category: 'Business', icon: 'business' },
    { name: 'Concierge', description: 'Concierge and guest services', category: 'Service', icon: 'concierge' },
    { name: 'Laundry Service', description: 'Laundry and dry cleaning', category: 'Service', icon: 'laundry', isChargeable: true },
    { name: 'Airport Shuttle', description: 'Complimentary airport transportation', category: 'Transportation', icon: 'shuttle' },
    { name: 'Parking', description: 'Free on-site parking', category: 'Transportation', icon: 'parking' },
    { name: 'Pet Friendly', description: 'Pets welcome', category: 'Policy', icon: 'pet' },
    
    // Resort Specific
    { name: 'Water Sports', description: 'Kayaking, jet skiing, and more', category: 'Recreation', icon: 'water-sports', isChargeable: true },
    { name: 'Tennis Court', description: 'Professional tennis court', category: 'Recreation', icon: 'tennis' },
    { name: 'Golf Course', description: 'Championship golf course', category: 'Recreation', icon: 'golf', isChargeable: true },
    { name: 'Beach Access', description: 'Private beach access', category: 'Recreation', icon: 'beach' },
    { name: 'Kids Club', description: 'Supervised activities for children', category: 'Family', icon: 'kids' },
    { name: 'Game Room', description: 'Indoor games and entertainment', category: 'Recreation', icon: 'games' },
    
    // Room Amenities
    { name: 'Air Conditioning', description: 'Individual climate control', category: 'Comfort', icon: 'ac' },
    { name: 'Mini Bar', description: 'In-room mini refrigerator', category: 'Convenience', icon: 'minibar', isChargeable: true },
    { name: 'Safe', description: 'In-room safety deposit box', category: 'Security', icon: 'safe' },
    { name: 'Balcony', description: 'Private balcony or terrace', category: 'Room Feature', icon: 'balcony' },
    { name: 'Ocean View', description: 'Ocean or lake view', category: 'Room Feature', icon: 'view' },
    { name: 'Kitchenette', description: 'Basic cooking facilities', category: 'Convenience', icon: 'kitchen' }
  ];

  const createdAmenities = [];
  for (const businessUnit of createdBusinessUnits) {
    for (const amenity of amenities) {
      // Skip some amenities for hotel vs resort
      if (businessUnit.propertyType === PropertyType.HOTEL && 
          ['Water Sports', 'Tennis Court', 'Golf Course', 'Beach Access', 'Kids Club'].includes(amenity.name)) {
        continue;
      }
      
      const created = await prisma.amenity.create({
        data: {
          businessUnitId: businessUnit.id,
          name: amenity.name,
          description: amenity.description,
          category: amenity.category,
          icon: amenity.icon,
          isChargeable: amenity.isChargeable || false,
          chargeAmount: amenity.isChargeable ? 500.00 : null
        }
      });
      createdAmenities.push(created);
    }
  }

  // 11. Create Room Types
  const roomTypeTemplates = [
    {
      name: 'standard_room',
      displayName: 'Standard Room',
      description: 'Comfortable accommodations with essential amenities',
      type: RoomType.STANDARD,
      maxOccupancy: 2,
      maxAdults: 2,
      maxChildren: 1,
      bedConfiguration: '1 Queen Bed or 2 Single Beds',
      roomSize: 25.0,
      baseRate: 2500.00,
      amenityNames: ['Free WiFi', 'Air Conditioning', 'Safe', 'Room Service']
    },
    {
      name: 'deluxe_room',
      displayName: 'Deluxe Room',
      description: 'Spacious room with enhanced amenities and city view',
      type: RoomType.DELUXE,
      maxOccupancy: 3,
      maxAdults: 2,
      maxChildren: 2,
      bedConfiguration: '1 King Bed',
      roomSize: 35.0,
      baseRate: 3500.00,
      hasBalcony: true,
      amenityNames: ['Free WiFi', 'Air Conditioning', 'Safe', 'Mini Bar', 'Balcony', 'Room Service']
    },
    {
      name: 'suite',
      displayName: 'Executive Suite',
      description: 'Luxurious suite with separate living area',
      type: RoomType.SUITE,
      maxOccupancy: 4,
      maxAdults: 3,
      maxChildren: 2,
      bedConfiguration: '1 King Bed + Sofa Bed',
      roomSize: 55.0,
      baseRate: 6500.00,
      hasBalcony: true,
      hasLivingArea: true,
      amenityNames: ['Free WiFi', 'Air Conditioning', 'Safe', 'Mini Bar', 'Balcony', 'Room Service', 'Kitchenette']
    },
    {
      name: 'villa',
      displayName: 'Private Villa',
      description: 'Standalone villa with private amenities',
      type: RoomType.VILLA,
      maxOccupancy: 6,
      maxAdults: 4,
      maxChildren: 3,
      bedConfiguration: '2 King Beds + Living Area',
      roomSize: 85.0,
      baseRate: 12500.00,
      hasBalcony: true,
      hasLivingArea: true,
      hasKitchenette: true,
      hasOceanView: true,
      amenityNames: ['Free WiFi', 'Air Conditioning', 'Safe', 'Mini Bar', 'Balcony', 'Ocean View', 'Kitchenette', 'Room Service']
    }
  ];

  const createdRoomTypes = [];
  for (const businessUnit of createdBusinessUnits) {
    for (const roomTypeTemplate of roomTypeTemplates) {
      // Skip villas for regular hotels
      if (businessUnit.propertyType === PropertyType.HOTEL && roomTypeTemplate.type === RoomType.VILLA) {
        continue;
      }
      
      const roomType = await prisma.roomType_Model.create({
        data: {
          businessUnitId: businessUnit.id,
          name: roomTypeTemplate.name,
          displayName: roomTypeTemplate.displayName,
          description: roomTypeTemplate.description,
          type: roomTypeTemplate.type,
          maxOccupancy: roomTypeTemplate.maxOccupancy,
          maxAdults: roomTypeTemplate.maxAdults,
          maxChildren: roomTypeTemplate.maxChildren,
          bedConfiguration: roomTypeTemplate.bedConfiguration,
          roomSize: roomTypeTemplate.roomSize,
          hasBalcony: roomTypeTemplate.hasBalcony || false,
          hasOceanView: roomTypeTemplate.hasOceanView || false,
          hasLivingArea: roomTypeTemplate.hasLivingArea || false,
          hasKitchenette: roomTypeTemplate.hasKitchenette || false,
          baseRate: roomTypeTemplate.baseRate,
          extraPersonRate: 500.00,
          extraChildRate: 250.00
        }
      });
      createdRoomTypes.push({ ...roomType, amenityNames: roomTypeTemplate.amenityNames });
    }
  }

  // 12. Create Room Type Amenity Associations
  for (const roomType of createdRoomTypes) {
    const businessUnitAmenities = createdAmenities.filter(a => a.businessUnitId === roomType.businessUnitId);
    
    for (const amenityName of roomType.amenityNames) {
      const amenity = businessUnitAmenities.find(a => a.name === amenityName);
      if (amenity) {
        await prisma.roomTypeAmenity.create({
          data: {
            roomTypeId: roomType.id,
            amenityId: amenity.id
          }
        });
      }
    }
  }

  // 13. Create Individual Rooms

// Replace the existing roomCounts definition with this:
const roomCounts = {
  [RoomType.STANDARD]: 20,
  [RoomType.DELUXE]: 15,
  [RoomType.SUITE]: 8,
  [RoomType.VILLA]: 5,
  [RoomType.PENTHOUSE]: 3,
  [RoomType.FAMILY]: 10,      // Add this
  [RoomType.ACCESSIBLE]: 4    // Add this
};

  const createdRooms = [];
  for (const businessUnit of createdBusinessUnits) {
    const businessUnitRoomTypes = createdRoomTypes.filter(rt => rt.businessUnitId === businessUnit.id);
    
    let roomNumber = 100;
    for (const roomType of businessUnitRoomTypes) {
      const count = roomCounts[roomType.type] || 5;
      
      for (let i = 0; i < count; i++) {
        const room = await prisma.room.create({
          data: {
            businessUnitId: businessUnit.id,
            roomTypeId: roomType.id,
            roomNumber: `${roomNumber + i}`,
            floor: Math.floor((roomNumber + i) / 100),
            status: RoomStatus.AVAILABLE,
            housekeeping: HousekeepingStatus.CLEAN,
            currentRate: roomType.baseRate,
            lastRateUpdate: new Date()
          }
        });
        createdRooms.push(room);
      }
      roomNumber += count + 5; // Gap between room types
    }
  }

  // 14. Create Room Rates
  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);

  for (const roomType of createdRoomTypes) {
    // Base rate
    await prisma.roomRate.create({
      data: {
        roomTypeId: roomType.id,
        name: 'Standard Rate',
        description: 'Standard published rate',
        baseRate: roomType.baseRate,
        validFrom: today,
        validTo: nextYear,
        extraPersonRate: 500.00,
        childRate: 250.00
      }
    });

   await prisma.roomRate.create({
    data: {
      roomTypeId: roomType.id,
      name: 'Weekend Rate',
      description: 'Weekend premium rate',
      baseRate: Number(roomType.baseRate) * 1.2, // Convert Decimal to number
      validFrom: today,
      validTo: nextYear,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: true,
      saturday: true,
      sunday: true,
      extraPersonRate: 500.00,
      childRate: 250.00,
      priority: 1
    }
  });
}

  // 15. Create Services
  const serviceTemplates = [
    { name: 'Airport Transfer', description: 'Round trip airport transportation', category: ServiceCategory.TRANSPORTATION, basePrice: 1500.00 },
    { name: 'Laundry Service', description: 'Same day laundry service', category: ServiceCategory.LAUNDRY, basePrice: 200.00 },
    { name: 'Spa Treatment', description: 'Full body massage and spa services', category: ServiceCategory.SPA, basePrice: 2500.00 },
    { name: 'Room Service', description: '24-hour in-room dining', category: ServiceCategory.ROOM_SERVICE, basePrice: 100.00 },
    { name: 'Concierge Service', description: 'Personal concierge assistance', category: ServiceCategory.CONCIERGE, basePrice: 0.00, isChargeable: false },
    { name: 'Extra Housekeeping', description: 'Additional room cleaning service', category: ServiceCategory.HOUSEKEEPING, basePrice: 500.00 },
    { name: 'Equipment Repair', description: 'Room equipment maintenance and repair', category: ServiceCategory.MAINTENANCE, basePrice: 800.00 },
    { name: 'Event Planning', description: 'Special event coordination', category: ServiceCategory.SPECIAL_REQUEST, basePrice: 5000.00 }
  ];

  const createdServices = [];
  for (const businessUnit of createdBusinessUnits) {
    const businessUnitDepartments = createdDepartments.filter(d => d.businessUnitId === businessUnit.id);
    
    for (const serviceTemplate of serviceTemplates) {
      // Find appropriate department
      let departmentId = null;
      if (serviceTemplate.category === ServiceCategory.HOUSEKEEPING) {
        departmentId = businessUnitDepartments.find(d => d.name === 'Housekeeping')?.id;
      } else if (serviceTemplate.category === ServiceCategory.SPA) {
        departmentId = businessUnitDepartments.find(d => d.name === 'Spa & Wellness')?.id;
      } else if (serviceTemplate.category === ServiceCategory.ROOM_SERVICE) {
        departmentId = businessUnitDepartments.find(d => d.name === 'Food & Beverage')?.id;
      } else if (serviceTemplate.category === ServiceCategory.TRANSPORTATION) {
        departmentId = businessUnitDepartments.find(d => d.name === 'Front Office')?.id;
      } else if (serviceTemplate.category === ServiceCategory.MAINTENANCE) {
        departmentId = businessUnitDepartments.find(d => d.name === 'Maintenance')?.id;
      }
      
      const service = await prisma.service.create({
        data: {
          businessUnitId: businessUnit.id,
          departmentId,
          name: serviceTemplate.name,
          description: serviceTemplate.description,
          category: serviceTemplate.category,
          basePrice: serviceTemplate.basePrice,
          isChargeable: serviceTemplate.isChargeable !== false,
          duration: 60, // Default 60 minutes
          availableHours: {
            monday: { start: '08:00', end: '20:00' },
            tuesday: { start: '08:00', end: '20:00' },
            wednesday: { start: '08:00', end: '20:00' },
            thursday: { start: '08:00', end: '20:00' },
            friday: { start: '08:00', end: '20:00' },
            saturday: { start: '08:00', end: '20:00' },
            sunday: { start: '08:00', end: '20:00' }
          }
        }
      });
      createdServices.push(service);
    }
  }

  // 16. Create Sample Guests
  const sampleGuests = [
    {
      firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '+63 917 123 4567',
      nationality: 'American', city: 'Manila', country: 'Philippines'
    },
    {
      firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@email.com', phone: '+63 917 234 5678',
      nationality: 'Filipino', city: 'Cebu City', country: 'Philippines', vipStatus: true
    },
    {
      firstName: 'David', lastName: 'Johnson', email: 'david.johnson@email.com', phone: '+63 917 345 6789',
      nationality: 'Canadian', city: 'Toronto', country: 'Canada'
    },
    {
      firstName: 'Ana', lastName: 'Rodriguez', email: 'ana.rodriguez@email.com', phone: '+63 917 456 7890',
      nationality: 'Spanish', city: 'Madrid', country: 'Spain'
    }
  ];

  const createdGuests = [];
  for (const businessUnit of createdBusinessUnits) {
    for (const guestTemplate of sampleGuests) {
      const guest = await prisma.guest.create({
        data: {
          businessUnitId: businessUnit.id,
          ...guestTemplate,
          firstStayDate: new Date('2023-01-15'),
          lastStayDate: new Date('2024-10-15'),
          totalSpent: Math.floor(Math.random() * 50000) + 5000,
          preferences: {
            roomPreferences: ['high floor', 'quiet room'],
            dietaryRestrictions: [],
            specialRequests: ['extra pillows']
          }
        }
      });
      createdGuests.push(guest);
    }
  }

  // 17. Create Sample Reservations
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  
  const checkoutDate = new Date(futureDate);
  checkoutDate.setDate(checkoutDate.getDate() + 3);

  for (let i = 0; i < createdBusinessUnits.length; i++) {
    const businessUnit = createdBusinessUnits[i];
    const businessUnitGuests = createdGuests.filter(g => g.businessUnitId === businessUnit.id);
    const businessUnitRoomTypes = createdRoomTypes.filter(rt => rt.businessUnitId === businessUnit.id);
    const businessUnitRooms = createdRooms.filter(r => r.businessUnitId === businessUnit.id);
    
    for (let j = 0; j < 3; j++) {
      const guest = businessUnitGuests[j];
      const roomType = businessUnitRoomTypes[j % businessUnitRoomTypes.length];
      const availableRooms = businessUnitRooms.filter(r => r.roomTypeId === roomType.id);
      
      if (guest && roomType && availableRooms.length > 0) {
        const selectedRoom = availableRooms[0];
        const nights = 3;
        const subtotal = Number(roomType.baseRate) * nights;
        const taxes = subtotal * 0.12;
        const totalAmount = subtotal + taxes;
        
        const reservationDate = new Date(futureDate);
        reservationDate.setDate(reservationDate.getDate() + (j * 7));
        const checkoutDate = new Date(reservationDate);
        checkoutDate.setDate(checkoutDate.getDate() + nights);
        
        const reservation = await prisma.reservation.create({
          data: {
            businessUnitId: businessUnit.id,
            guestId: guest.id,
            confirmationNumber: `TR${Date.now()}${j}`,
            source: ReservationSource.WEBSITE,
            status: ReservationStatus.CONFIRMED,
            checkInDate: reservationDate,
            checkOutDate: checkoutDate,
            nights,
            adults: 2,
            children: 0,
            subtotal,
            taxes,
            totalAmount,
            paymentStatus: PaymentStatus.PENDING,
            specialRequests: 'Late check-in requested'
          }
        });
        
        // Create reservation room
        await prisma.reservationRoom.create({
          data: {
            reservationId: reservation.id,
            roomId: selectedRoom.id,
            roomTypeId: roomType.id,
            baseRate: roomType.baseRate,
            nights,
            adults: 2,
            roomSubtotal: subtotal,
            totalAmount: subtotal
          }
        });
      }
    }
  }

  // 18. Create Special Offers
  const specialOffers = [
    {
      title: 'Early Bird Special',
      slug: 'early-bird-special',
      subtitle: 'Book 30 days in advance and save',
      description: 'Save up to 25% when you book your stay at least 30 days in advance. Perfect for planning your perfect getaway.',
      type: OfferType.EARLY_BIRD,
      status: OfferStatus.ACTIVE,
      originalPrice: 5000.00,
      offerPrice: 3750.00,
      savingsAmount: 1250.00,
      savingsPercent: 25,
      validFrom: today,
      validTo: nextYear,
      minNights: 2,
      minAdvanceBook: 30,
      inclusions: ['Free breakfast', 'Late checkout', 'Welcome drink'],
      termsConditions: 'Subject to availability. Cannot be combined with other offers.'
    },
    {
      title: 'Weekend Getaway Package',
      slug: 'weekend-getaway-package',
      subtitle: 'Perfect weekend escape',
      description: 'Enjoy a relaxing weekend with our special package including meals, spa credits, and activities.',
      type: OfferType.PACKAGE,
      status: OfferStatus.ACTIVE,
      originalPrice: 8000.00,
      offerPrice: 6500.00,
      savingsAmount: 1500.00,
      savingsPercent: 19,
      validFrom: today,
      validTo: nextYear,
      minNights: 2,
      maxNights: 3,
      friday: false,
      saturday: true,
      sunday: true,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      inclusions: ['Breakfast and dinner', 'Spa credit PHP 1,000', 'Welcome amenities', 'Late checkout'],
      termsConditions: 'Valid for weekend stays only. Advance booking required.'
    },
    {
      title: 'Long Stay Discount',
      slug: 'long-stay-discount',
      subtitle: 'Stay longer, save more',
      description: 'Extended stays of 7 nights or more receive special discounted rates and additional perks.',
      type: OfferType.SEASONAL,
      status: OfferStatus.ACTIVE,
      originalPrice: 15000.00,
      offerPrice: 12000.00,
      savingsAmount: 3000.00,
      savingsPercent: 20,
      validFrom: today,
      validTo: nextYear,
      minNights: 7,
      inclusions: ['Daily breakfast', 'Airport transfer', 'Laundry service', 'Welcome fruit basket'],
      termsConditions: 'Minimum 7-night stay required. Cannot be combined with other promotions.'
    }
  ];

  const createdOffers = [];
  for (const businessUnit of createdBusinessUnits) {
    for (const offerTemplate of specialOffers) {
      const offer = await prisma.specialOffer.create({
        data: {
          businessUnitId: businessUnit.id,
          ...offerTemplate,
          slug: `${offerTemplate.slug}-${businessUnit.slug}`,
          isPublished: true,
          publishedAt: new Date(),
          metaTitle: `${offerTemplate.title} - ${businessUnit.displayName}`,
          metaDescription: offerTemplate.description
        }
      });
      createdOffers.push(offer);
      
      // Associate with room types
      const businessUnitRoomTypes = createdRoomTypes.filter(rt => rt.businessUnitId === businessUnit.id);
      for (const roomType of businessUnitRoomTypes) {
        await prisma.offerRoomType.create({
          data: {
            offerId: offer.id,
            roomTypeId: roomType.id
          }
        });
      }
    }
  }

  // 19. Create Restaurants
  const restaurantTemplates = [
    {
      name: 'The Main Dining',
      slug: 'main-dining',
      description: 'Our signature restaurant featuring international cuisine and local specialties',
      type: RestaurantType.CASUAL_DINING,
      cuisine: ['International', 'Filipino', 'Asian'],
      totalSeats: 80,
      operatingHours: {
        monday: { breakfast: '06:00-10:00', lunch: '11:30-14:30', dinner: '18:00-22:00' },
        tuesday: { breakfast: '06:00-10:00', lunch: '11:30-14:30', dinner: '18:00-22:00' },
        wednesday: { breakfast: '06:00-10:00', lunch: '11:30-14:30', dinner: '18:00-22:00' },
        thursday: { breakfast: '06:00-10:00', lunch: '11:30-14:30', dinner: '18:00-22:00' },
        friday: { breakfast: '06:00-10:00', lunch: '11:30-14:30', dinner: '18:00-22:30' },
        saturday: { breakfast: '06:00-10:30', lunch: '11:30-14:30', dinner: '18:00-22:30' },
        sunday: { breakfast: '06:00-10:30', lunch: '11:30-14:30', dinner: '18:00-22:00' }
      },
      features: ['Air-conditioned', 'Free WiFi', 'Private dining rooms'],
      priceRange: 'PHP 500 - 1,500',
      averageMeal: 850.00
    },
    {
      name: 'Poolside Grill',
      slug: 'poolside-grill',
      description: 'Casual outdoor dining by the pool with grilled specialties and refreshing drinks',
      type: RestaurantType.POOLSIDE,
      cuisine: ['Grilled', 'Casual', 'Beverages'],
      totalSeats: 40,
      outdoorSeating: true,
      operatingHours: {
        monday: { lunch: '11:00-17:00' },
        tuesday: { lunch: '11:00-17:00' },
        wednesday: { lunch: '11:00-17:00' },
        thursday: { lunch: '11:00-17:00' },
        friday: { lunch: '11:00-17:00' },
        saturday: { lunch: '11:00-18:00' },
        sunday: { lunch: '11:00-18:00' }
      },
      features: ['Outdoor seating', 'Pool view', 'Live music weekends'],
      priceRange: 'PHP 300 - 800',
      averageMeal: 450.00
    },
    {
      name: 'The Coffee Shop',
      slug: 'coffee-shop',
      description: 'Cozy coffee shop serving premium coffee, pastries, and light meals',
      type: RestaurantType.CAFE,
      cuisine: ['Coffee', 'Pastries', 'Light meals'],
      totalSeats: 25,
      operatingHours: {
        monday: { allDay: '06:00-20:00' },
        tuesday: { allDay: '06:00-20:00' },
        wednesday: { allDay: '06:00-20:00' },
        thursday: { allDay: '06:00-20:00' },
        friday: { allDay: '06:00-21:00' },
        saturday: { allDay: '06:00-21:00' },
        sunday: { allDay: '07:00-20:00' }
      },
      features: ['Free WiFi', 'Takeaway available', 'Outdoor terrace'],
      priceRange: 'PHP 150 - 500',
      averageMeal: 250.00
    }
  ];

  const createdRestaurants = [];
  for (const businessUnit of createdBusinessUnits) {
    for (const restaurantTemplate of restaurantTemplates) {
      // Skip poolside grill for regular hotels
      if (businessUnit.propertyType === PropertyType.HOTEL && restaurantTemplate.type === RestaurantType.POOLSIDE) {
        continue;
      }
      
      const restaurant = await prisma.restaurant.create({
        data: {
          businessUnitId: businessUnit.id,
          ...restaurantTemplate,
          slug: `${restaurantTemplate.slug}-${businessUnit.slug}`,
          isPublished: true,
          publishedAt: new Date(),
          metaTitle: `${restaurantTemplate.name} - ${businessUnit.displayName}`,
          metaDescription: restaurantTemplate.description
        }
      });
      createdRestaurants.push(restaurant);
    }
  }

  // 20. Create Menu Categories and Items
  const menuData = [
    {
      categoryName: 'Appetizers',
      items: [
        { name: 'Caesar Salad', description: 'Fresh romaine lettuce with parmesan and croutons', price: 380.00, dietary: ['Vegetarian'] },
        { name: 'Buffalo Wings', description: 'Spicy chicken wings with blue cheese dip', price: 450.00, spiceLevel: 2 },
        { name: 'Calamari Rings', description: 'Crispy fried squid with marinara sauce', price: 420.00 },
        { name: 'Vegetable Spring Rolls', description: 'Fresh vegetables wrapped in rice paper', price: 320.00, dietary: ['Vegetarian', 'Vegan'] }
      ]
    },
    {
      categoryName: 'Main Courses',
      items: [
        { name: 'Grilled Salmon', description: 'Atlantic salmon with lemon herb butter', price: 950.00, isSignature: true },
        { name: 'Beef Tenderloin', description: 'Premium beef with mushroom sauce', price: 1200.00, isSignature: true },
        { name: 'Chicken Adobo', description: 'Traditional Filipino braised chicken', price: 580.00, isRecommended: true },
        { name: 'Vegetarian Pasta', description: 'Penne with seasonal vegetables and herb sauce', price: 520.00, dietary: ['Vegetarian'] },
        { name: 'Fish and Chips', description: 'Beer-battered fish with crispy fries', price: 680.00 },
        { name: 'Pork Sisig', description: 'Filipino sizzling pork with onions', price: 620.00, spiceLevel: 1 }
      ]
    },
    {
      categoryName: 'Desserts',
      items: [
        { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with vanilla ice cream', price: 280.00, isRecommended: true },
        { name: 'Mango Cheesecake', description: 'Local mango with cream cheese', price: 260.00 },
        { name: 'Halo-Halo', description: 'Traditional Filipino mixed dessert', price: 220.00, isSignature: true },
        { name: 'Ice Cream Sundae', description: 'Three scoops with chocolate sauce and nuts', price: 200.00 }
      ]
    },
    {
      categoryName: 'Beverages',
      items: [
        { name: 'Fresh Fruit Smoothie', description: 'Seasonal fruit blend', price: 180.00, dietary: ['Vegan'] },
        { name: 'Local Coffee', description: 'Premium Filipino coffee beans', price: 150.00 },
        { name: 'Fresh Coconut Water', description: 'Direct from the coconut', price: 120.00, dietary: ['Vegan'] },
        { name: 'House Wine', description: 'Selection of local and imported wines', price: 220.00 },
        { name: 'Craft Beer', description: 'Local brewery selection', price: 180.00 }
      ]
    }
  ];

  for (const restaurant of createdRestaurants) {
    for (const categoryData of menuData) {
      const category = await prisma.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: categoryData.categoryName,
          description: `Delicious ${categoryData.categoryName.toLowerCase()} selection`
        }
      });
      
      for (const itemData of categoryData.items) {
        await prisma.menuItem.create({
          data: {
            categoryId: category.id,
            name: itemData.name,
            description: itemData.description,
            price: itemData.price,
            dietary: itemData.dietary || [],
            spiceLevel: itemData.spiceLevel || 0,
            isSignature: itemData.isSignature || false,
            isRecommended: itemData.isRecommended || false
          }
        });
      }
    }
  }

  // 21. Create Events
  const eventTemplates = [
    {
      title: 'New Year Celebration',
      slug: 'new-year-celebration',
      description: 'Ring in the New Year with our spectacular celebration featuring live music, gourmet dinner, and fireworks',
      type: EventType.CELEBRATION,
      status: EventStatus.PLANNING,
      category: ['Holiday', 'Entertainment'],
      startDate: new Date('2024-12-31'),
      endDate: new Date('2025-01-01'),
      startTime: '19:00',
      endTime: '02:00',
      venue: 'Grand Ballroom',
      venueCapacity: 200,
      isFree: false,
      ticketPrice: 2500.00,
      requiresBooking: true,
      maxAttendees: 200,
      bookingOpenDate: new Date('2024-10-01'),
      bookingCloseDate: new Date('2024-12-25'),
      highlights: ['Live band performance', 'Five-course dinner', 'Champagne toast', 'Fireworks display'],
      includes: ['Dinner', 'Entertainment', 'Welcome drink', 'Party favors'],
      hostName: 'Tropicana Events Team'
    },
    {
      title: 'Cooking Class Series',
      slug: 'cooking-class-series',
      description: 'Learn to cook authentic Filipino dishes with our executive chef',
      type: EventType.WORKSHOP,
      status: EventStatus.CONFIRMED,
      category: ['Culinary', 'Educational'],
      startDate: new Date('2024-11-15'),
      endDate: new Date('2024-11-15'),
      startTime: '14:00',
      endTime: '17:00',
      venue: 'Chef\'s Kitchen',
      venueCapacity: 12,
      isFree: false,
      ticketPrice: 1800.00,
      requiresBooking: true,
      maxAttendees: 12,
      isRecurring: true,
      recurrenceRule: 'Weekly on Fridays',
      bookingOpenDate: new Date('2024-10-01'),
      bookingCloseDate: new Date('2024-11-13'),
      highlights: ['Hands-on cooking', 'Recipe cards included', 'Chef demonstration', 'Take home your creations'],
      includes: ['All ingredients', 'Cooking equipment', 'Recipe book', 'Light refreshments'],
      hostName: 'Chef Miguel Santos',
      hostBio: '20+ years experience in Filipino and international cuisine'
    },
    {
      title: 'Sunset Yoga Sessions',
      slug: 'sunset-yoga-sessions',
      description: 'Relax and rejuvenate with our weekly sunset yoga sessions by the pool',
      type: EventType.ENTERTAINMENT,
      status: EventStatus.CONFIRMED,
      category: ['Wellness', 'Recreation'],
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-12-31'),
      startTime: '17:30',
      endTime: '18:30',
      venue: 'Pool Deck',
      venueCapacity: 20,
      isFree: true,
      requiresBooking: true,
      maxAttendees: 20,
      isRecurring: true,
      recurrenceRule: 'Weekly on Sundays',
      bookingOpenDate: new Date('2024-10-15'),
      highlights: ['Professional instructor', 'Stunning sunset views', 'All levels welcome', 'Yoga mats provided'],
      includes: ['Yoga mat', 'Towel', 'Refreshing drink'],
      hostName: 'Maria Elena Yoga Studio',
      requirements: ['Comfortable clothing', 'Empty stomach (2 hours after meal)']
    }
  ];

  const createdEvents = [];
  for (const businessUnit of createdBusinessUnits) {
    for (const eventTemplate of eventTemplates) {
      const event = await prisma.event.create({
        data: {
          businessUnitId: businessUnit.id,
          ...eventTemplate,
          slug: `${eventTemplate.slug}-${businessUnit.slug}`,
          isPublished: true,
          publishedAt: new Date(),
          metaTitle: `${eventTemplate.title} - ${businessUnit.displayName}`,
          metaDescription: eventTemplate.description
        }
      });
      createdEvents.push(event);
    }
  }

  // 22. Create Content Items
  const contentItems = [
    {
      key: 'homepage_hero_title',
      section: 'homepage',
      name: 'Hero Section Title',
      content: 'Experience Paradise in Every Stay',
      contentType: ContentType.TEXT,
      scope: ContentScope.GLOBAL
    },
    {
      key: 'homepage_hero_subtitle',
      section: 'homepage', 
      name: 'Hero Section Subtitle',
      content: 'Discover luxury accommodations and exceptional service across our premium properties in the Philippines',
      contentType: ContentType.TEXT,
      scope: ContentScope.GLOBAL
    },
    {
      key: 'about_us_content',
      section: 'about',
      name: 'About Us Content',
      content: `<h2>Welcome to Tropicana Hotels & Resorts</h2>
<p>For over a decade, Tropicana Hotels & Resorts has been synonymous with exceptional hospitality and unforgettable experiences in the Philippines. Our collection of premium properties offers something for every traveler - from business hotels to tropical resorts.</p>
<h3>Our Properties</h3>
<p>Each of our properties is carefully designed to provide the perfect blend of comfort, luxury, and authentic Filipino hospitality. Whether you're seeking a business-friendly environment or a tropical paradise, we have the perfect accommodation for you.</p>
<h3>Our Commitment</h3>
<p>We are committed to providing exceptional service, sustainable practices, and memorable experiences that exceed our guests' expectations. Every stay with us is designed to create lasting memories.</p>`,
      contentType: ContentType.HTML,
      scope: ContentScope.GLOBAL
    },
    {
      key: 'booking_terms',
      section: 'booking',
      name: 'Booking Terms and Conditions',
      content: `## Booking Terms and Conditions

### Reservation Policy
- All reservations are subject to availability
- A valid credit card is required to guarantee your reservation
- Check-in time is 3:00 PM, check-out time is 12:00 PM

### Cancellation Policy
- Free cancellation up to 24 hours before arrival
- Late cancellations may be subject to charges
- No-shows will be charged for the full stay

### Payment Terms
- Payment is due at time of booking or upon arrival
- We accept major credit cards and cash
- Additional charges may apply for extra services

### Hotel Policies
- Photo ID required at check-in
- Smoking is prohibited in all rooms
- Pets are welcome in designated pet-friendly rooms`,
      contentType: ContentType.MARKDOWN,
      scope: ContentScope.GLOBAL
    },
    {
      key: 'contact_info',
      section: 'contact',
      name: 'Contact Information',
      content: `{
  "phone": "+63 83 552 8888",
  "email": "info@tropicanahotels.com",
  "address": "General Santos City, Philippines",
  "hours": "24/7 Customer Service",
  "emergency": "+63 83 552 9999"
}`,
      contentType: ContentType.JSON,
      scope: ContentScope.GLOBAL
    }
  ];

  for (const contentItem of contentItems) {
    await prisma.contentItem.create({
      data: {
        ...contentItem,
        authorId: adminUser.id,
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date()
      }
    });
  }

  // 23. Create Testimonials
  const testimonials = [
    {
      guestName: 'Sarah Johnson',
      guestTitle: 'Business Executive',
      guestCountry: 'United States',
      content: 'Absolutely wonderful stay! The staff went above and beyond to make our business trip comfortable and productive. The facilities are top-notch and the location is perfect.',
      rating: 5,
      source: 'Google Reviews',
      stayDate: new Date('2024-09-15'),
      reviewDate: new Date('2024-09-18'),
      isActive: true,
      isFeatured: true,
      scope: ContentScope.GLOBAL
    },
    {
      guestName: 'Miguel Rodriguez',
      guestTitle: 'Family Traveler',
      guestCountry: 'Spain',
      content: 'Our family vacation was amazing! The kids loved the pool and activities, while my wife and I enjoyed the spa and restaurants. Will definitely return!',
      rating: 5,
      source: 'TripAdvisor',
      stayDate: new Date('2024-08-22'),
      reviewDate: new Date('2024-08-25'),
      isActive: true,
      isFeatured: true,
      scope: ContentScope.GLOBAL
    },
    {
      guestName: 'Lisa Chen',
      guestTitle: 'Travel Blogger',
      guestCountry: 'Singapore',
      content: 'Beautiful property with stunning views and excellent service. The attention to detail in every aspect of the stay was impressive. Highly recommended for anyone visiting General Santos.',
      rating: 5,
      source: 'Blog Review',
      stayDate: new Date('2024-07-10'),
      reviewDate: new Date('2024-07-12'),
      isActive: true,
      isFeatured: false,
      scope: ContentScope.GLOBAL
    },
    {
      guestName: 'Roberto Santos',
      guestTitle: 'Local Guest',
      guestCountry: 'Philippines',
      content: 'Proud to have such a world-class hotel in our city. The service is exceptional and the food at the restaurant is outstanding. Perfect for special occasions.',
      rating: 5,
      source: 'Facebook Reviews',
      stayDate: new Date('2024-06-28'),
      reviewDate: new Date('2024-06-30'),
      isActive: true,
      isFeatured: false,
      scope: ContentScope.GLOBAL
    }
  ];

  const createdTestimonials = [];
  for (const testimonial of testimonials) {
    const created = await prisma.testimonial.create({
      data: testimonial
    });
    createdTestimonials.push(created);
  }

  // Associate testimonials with all properties
  for (const testimonial of createdTestimonials) {
    if (testimonial.isFeatured) {
      for (const businessUnit of createdBusinessUnits) {
        await prisma.propertyTestimonial.create({
          data: {
            propertyId: businessUnit.id,
            testimonialId: testimonial.id
          }
        });
      }
    }
  }

const faqs = [
    {
      question: 'What is your check-in and check-out time?',
      answer: 'Check-in time is 3:00 PM and check-out time is 12:00 PM. Early check-in and late check-out may be available upon request and subject to availability.',
      category: 'Booking & Reservations',
      scope: ContentScope.GLOBAL
    },
    {
      question: 'Do you offer airport transportation?',
      answer: 'Yes, we provide complimentary airport shuttle service for our guests. Please contact us at least 24 hours in advance to arrange pickup.',
      category: 'Transportation',
      scope: ContentScope.GLOBAL
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Free cancellation up to 24 hours before your scheduled arrival. Cancellations made within 24 hours may be subject to a one-night charge.',
      category: 'Booking & Reservations',
      scope: ContentScope.GLOBAL
    },
    {
      question: 'Are pets allowed in your properties?',
      answer: 'Yes, we welcome pets in designated pet-friendly rooms. Additional pet fees may apply. Please inform us when making your reservation.',
      category: 'Policies',
      scope: ContentScope.GLOBAL
    },
    {
      question: 'Do you have restaurants on-site?',
      answer: 'Yes, all our properties feature on-site dining options ranging from casual cafes to fine dining restaurants serving international and local cuisine.',
      category: 'Dining & Facilities',
      scope: ContentScope.GLOBAL
    },
    {
      question: 'Is WiFi available throughout the property?',
      answer: 'Yes, complimentary high-speed WiFi is available in all guest rooms and public areas throughout our properties.',
      category: 'Amenities',
      scope: ContentScope.GLOBAL
    },
    {
      question: 'Do you offer meeting and event facilities?',
      answer: 'Yes, we have various meeting rooms and event spaces available for conferences, weddings, and special occasions. Please contact our events team for details.',
      category: 'Events & Meetings',
      scope: ContentScope.GLOBAL
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept major credit cards (Visa, Mastercard, American Express), cash, and various digital payment methods including GCash and PayMaya.',
      category: 'Payment',
      scope: ContentScope.GLOBAL
    }
  ];

  const createdFAQs = [];
  for (const faq of faqs) {
    const created = await prisma.fAQ.create({
      data: faq
    });
    createdFAQs.push(created);
  }

  // Associate FAQs with all properties
  for (const faq of createdFAQs) {
    for (const businessUnit of createdBusinessUnits) {
      await prisma.propertyFAQ.create({
        data: {
          propertyId: businessUnit.id,
          faqId: faq.id
        }
      });
    }
  }

  // 25. Create Hero Sections
  const heroes = [
    {
      title: 'Experience Paradise in Every Stay',
      subtitle: 'Discover luxury accommodations and exceptional service',
      description: 'From business hotels to tropical resorts, find your perfect getaway in the heart of General Santos City',
      buttonText: 'Book Now',
      buttonUrl: '/book',
      backgroundImage: '/images/hero-main.jpg',
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
      displayType: 'fullscreen',
      textAlignment: 'center',
      textColor: 'white',
      primaryButtonText: 'Book Your Stay',
      primaryButtonUrl: '/book',
      primaryButtonStyle: 'primary',
      secondaryButtonText: 'Explore Properties',
      secondaryButtonUrl: '/properties',
      secondaryButtonStyle: 'secondary',
      targetPages: ['homepage'],
      targetAudience: ['all'],
      altText: 'Tropicana Hotels luxury resort view'
    },
    {
      title: 'Luxury Meets Nature',
      subtitle: 'Tropical paradise awaits',
      description: 'Escape to our stunning lakeside and farm resorts where luxury meets the beauty of nature',
      buttonText: 'Discover Resorts',
      buttonUrl: '/properties?type=resort',
      backgroundImage: '/images/hero-resort.jpg',
      isActive: true,
      isFeatured: false,
      sortOrder: 2,
      displayType: 'fullscreen',
      textAlignment: 'left',
      textColor: 'white',
      primaryButtonText: 'View Resorts',
      primaryButtonUrl: '/properties?type=resort',
      targetPages: ['properties'],
      targetAudience: ['all'],
      altText: 'Tropical resort with lake view'
    }
  ];

  for (const hero of heroes) {
    await prisma.hero.create({
      data: hero
    });
  }

  // 26. Create Sample Images for Properties
const propertyImages = [
  // Anchor Hotel Images
  {
    filename: 'anchor-hotel-exterior.jpg',
    originalName: 'anchor-hotel-exterior.jpg',
    mimeType: 'image/jpeg',
    size: 2048000,
    url: '/images/properties/anchor-hotel-exterior.jpg',
    thumbnailUrl: '/images/properties/thumbs/anchor-hotel-exterior.jpg',
    title: 'Anchor Hotel Exterior',
    description: 'Modern exterior view of Anchor Hotel',
    altText: 'Anchor Hotel building exterior at night',
    category: MediaCategory.DOCUMENTS, // Change from ImageCategory.RESTAURANT
    scope: ContentScope.GLOBAL,
    uploaderId: adminUser.id
  },
  {
    filename: 'anchor-hotel-lobby.jpg',
    originalName: 'anchor-hotel-lobby.jpg',
    mimeType: 'image/jpeg',
    size: 1536000,
    url: '/images/properties/anchor-hotel-lobby.jpg',
    thumbnailUrl: '/images/properties/thumbs/anchor-hotel-lobby.jpg',
    title: 'Anchor Hotel Lobby',
    description: 'Elegant hotel lobby with modern furnishing',
    altText: 'Spacious hotel lobby with comfortable seating',
    category: MediaCategory.GALLERY, // Change from ImageCategory.AMENITY
    scope: ContentScope.PROPERTY,
    uploaderId: adminUser.id
  }
];

  const createdImages = [];
  for (const image of propertyImages) {
    const created = await prisma.mediaItem.create({
      data: image
    });
    createdImages.push(created);
  }

  // Associate images with properties
  const anchorHotel = createdBusinessUnits.find(bu => bu.name === 'anchor_hotel');
  if (anchorHotel) {
    for (const image of createdImages) {
      await prisma.propertyMedia.create({
        data: {
          propertyId: anchorHotel.id,
          mediaId: image.id
        }
      });
    }
  }

  // 27. Create Sample Promos
  const promos = [
    {
      code: 'WELCOME25',
      title: 'Welcome Discount',
      description: 'Get 25% off your first stay with us',
      type: PromoType.PERCENTAGE_DISCOUNT,
      status: PromoStatus.ACTIVE,
      discountValue: 25.00,
      maxDiscountAmount: 2500.00,
      minOrderAmount: 3000.00,
      maxUses: 100,
      maxUsesPerUser: 1,
      validFrom: today,
      validTo: nextYear,
      minNights: 2,
      requiresNewCustomer: true,
      isPublic: true,
      isFeatured: true,
      terms: 'Valid for new customers only. Minimum 2-night stay required.',
      createdBy: adminUser.id
    },
    {
      code: 'LONGSTAY',
      title: 'Extended Stay Discount',
      description: 'Save PHP 1,000 on stays of 7 nights or more',
      type: PromoType.FIXED_AMOUNT_DISCOUNT,
      status: PromoStatus.ACTIVE,
      discountValue: 1000.00,
      minOrderAmount: 10000.00,
      maxUses: 50,
      maxUsesPerUser: 2,
      validFrom: today,
      validTo: nextYear,
      minNights: 7,
      combinableWithOffers: false,
      isPublic: true,
      terms: 'Minimum 7-night stay required. Cannot be combined with other offers.',
      createdBy: adminUser.id
    },
    {
      code: 'WEEKEND50',
      title: 'Weekend Special',
      description: 'PHP 500 off weekend stays',
      type: PromoType.FIXED_AMOUNT_DISCOUNT,
      status: PromoStatus.ACTIVE,
      discountValue: 500.00,
      minOrderAmount: 2000.00,
      maxUsesPerUser: 1,
      validFrom: today,
      validTo: nextYear,
      validDays: { monday: false, tuesday: false, wednesday: false, thursday: false, friday: true, saturday: true, sunday: true },
      isPublic: true,
      terms: 'Valid for Friday to Sunday stays only.',
      createdBy: adminUser.id
    }
  ];

  const createdPromos = [];
  for (const promo of promos) {
    const created = await prisma.promo.create({
      data: promo
    });
    createdPromos.push(created);
  }

  // 28. Create Sample Vouchers
  const vouchers = [
    {
      voucherCode: 'GIFT500-001',
      status: VoucherStatus.ACTIVE,
      title: 'Gift Voucher - PHP 500',
      description: 'Gift voucher worth PHP 500',
      discountType: PromoType.FIXED_AMOUNT_DISCOUNT,
      discountValue: 500.00,
      validFrom: today,
      validTo: nextYear,
      maxUses: 1,
      assignedToEmail: 'gift@example.com',
      assignedToName: 'Gift Recipient',
      purchaseAmount: 500.00,
      remainingValue: 500.00
    },
    {
      voucherCode: 'COMP1000-001',
      status: VoucherStatus.ACTIVE,
      title: 'Complimentary Voucher',
      description: 'Complimentary voucher for valued guest',
      discountType: PromoType.FIXED_AMOUNT_DISCOUNT,
      discountValue: 1000.00,
      validFrom: today,
      validTo: nextYear,
      maxUses: 1,
      remainingValue: 1000.00,
      notes: 'Complimentary voucher for guest complaint resolution'
    }
  ];

  for (const voucher of vouchers) {
    await prisma.promoVoucher.create({
      data: voucher
    });
  }

  // 29. Create Contact Forms
  const contactForms = [
    {
      businessUnitId: anchorHotel?.id,
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+63 917 123 4567',
      subject: 'Room Booking Inquiry',
      message: 'Hello, I would like to inquire about room availability for next month. Could you please provide rates for deluxe rooms?',
      category: 'Booking Inquiry',
      status: 'new'
    },
    {
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      subject: 'Event Venue Inquiry',
      message: 'We are looking for a venue for our company retreat. Do you have conference facilities that can accommodate 50 people?',
      category: 'Event Inquiry',
      status: 'new'
    }
  ];

  for (const form of contactForms) {
    await prisma.contactForm.create({
      data: form
    });
  }

  // 30. Create Newsletter Subscriptions
  const newsletters = [
    {
      email: 'subscriber1@email.com',
      firstName: 'Alice',
      lastName: 'Johnson',
      isActive: true,
      confirmedAt: new Date(),
      preferences: { promotions: true, events: true, newsletter: true }
    },
    {
      email: 'subscriber2@email.com',
      firstName: 'Bob',
      lastName: 'Smith',
      isActive: true,
      confirmedAt: new Date(),
      preferences: { promotions: false, events: true, newsletter: true }
    }
  ];

  for (const newsletter of newsletters) {
    await prisma.newsletter.create({
      data: newsletter
    });
  }

  // 31. Create Email Templates
  const emailTemplates = [
    {
      name: 'booking_confirmation',
      subject: 'Booking Confirmation - {{confirmationNumber}}',
      htmlContent: `
        <h1>Booking Confirmed!</h1>
        <p>Dear {{guestName}},</p>
        <p>Thank you for choosing Tropicana Hotels. Your booking has been confirmed.</p>
        <h2>Booking Details</h2>
        <ul>
          <li>Confirmation Number: {{confirmationNumber}}</li>
          <li>Check-in: {{checkInDate}}</li>
          <li>Check-out: {{checkOutDate}}</li>
          <li>Room Type: {{roomType}}</li>
          <li>Total Amount: {{totalAmount}}</li>
        </ul>
        <p>We look forward to welcoming you!</p>
      `,
      textContent: 'Booking Confirmed! Dear {{guestName}}, Thank you for choosing Tropicana Hotels...',
      variables: { guestName: 'string', confirmationNumber: 'string', checkInDate: 'date', checkOutDate: 'date', roomType: 'string', totalAmount: 'number' },
      category: 'booking'
    },
    {
      name: 'payment_confirmation',
      subject: 'Payment Received - {{confirmationNumber}}',
      htmlContent: `
        <h1>Payment Confirmed</h1>
        <p>Dear {{guestName}},</p>
        <p>We have successfully received your payment of {{amount}} for booking {{confirmationNumber}}.</p>
        <p>Payment Method: {{paymentMethod}}</p>
        <p>Transaction ID: {{transactionId}}</p>
      `,
      textContent: 'Payment Confirmed. Dear {{guestName}}, We have successfully received your payment...',
      variables: { guestName: 'string', amount: 'number', confirmationNumber: 'string', paymentMethod: 'string', transactionId: 'string' },
      category: 'payment'
    },
    {
      name: 'check_in_reminder',
      subject: 'Check-in Tomorrow - {{confirmationNumber}}',
      htmlContent: `
        <h1>Check-in Reminder</h1>
        <p>Dear {{guestName}},</p>
        <p>This is a friendly reminder that your check-in is scheduled for tomorrow at {{checkInDate}}.</p>
        <p>Check-in time: 3:00 PM</p>
        <p>We look forward to welcoming you to {{propertyName}}!</p>
      `,
      textContent: 'Check-in Reminder. Dear {{guestName}}, This is a friendly reminder...',
      variables: { guestName: 'string', checkInDate: 'date', propertyName: 'string', confirmationNumber: 'string' },
      category: 'reminder'
    },
    {
      name: 'welcome_email',
      subject: 'Welcome to Tropicana Hotels!',
      htmlContent: `
        <h1>Welcome to Tropicana Hotels!</h1>
        <p>Dear {{firstName}},</p>
        <p>Thank you for signing up for our newsletter. You'll be the first to know about:</p>
        <ul>
          <li>Special offers and promotions</li>
          <li>Upcoming events and activities</li>
          <li>New amenities and services</li>
        </ul>
        <p>Welcome to the Tropicana family!</p>
      `,
      textContent: 'Welcome to Tropicana Hotels! Dear {{firstName}}, Thank you for signing up...',
      variables: { firstName: 'string' },
      category: 'newsletter'
    }
  ];

  for (const template of emailTemplates) {
    await prisma.emailTemplate.create({
      data: template
    });
  }

  // 32. Create SEO Settings
  const seoSettings = [
    {
      path: '/',
      pageType: 'homepage',
      title: 'Tropicana Hotels & Resorts - Premium Hospitality in General Santos',
      description: 'Experience luxury accommodations and exceptional service at Tropicana Hotels & Resorts. Book your stay at our premium properties in General Santos City, Philippines.',
      keywords: 'hotel general santos, resort philippines, luxury accommodation, business hotel, tropical resort',
      ogTitle: 'Tropicana Hotels & Resorts - Premium Hospitality Experience',
      ogDescription: 'Discover luxury accommodations and exceptional service at our premium properties in General Santos City, Philippines.',
      ogImage: '/images/og-homepage.jpg',
      canonicalUrl: 'https://tropicanahotels.com/'
    },
    {
      path: '/properties',
      pageType: 'properties',
      title: 'Our Properties - Tropicana Hotels & Resorts',
      description: 'Explore our collection of premium hotels and resorts in General Santos City. From business hotels to tropical resorts, find your perfect accommodation.',
      keywords: 'hotel properties, resort collection, general santos accommodation',
      ogTitle: 'Our Premium Properties - Tropicana Hotels & Resorts',
      ogDescription: 'Explore our collection of premium hotels and resorts in General Santos City.',
      canonicalUrl: 'https://tropicanahotels.com/properties'
    },
    {
      path: '/book',
      pageType: 'booking',
      title: 'Book Your Stay - Tropicana Hotels & Resorts',
      description: 'Book your stay at Tropicana Hotels & Resorts. Check availability, compare rates, and enjoy the best prices guaranteed.',
      keywords: 'book hotel, hotel reservation, best rates guaranteed',
      ogTitle: 'Book Your Stay - Best Rates Guaranteed',
      ogDescription: 'Book your stay at Tropicana Hotels & Resorts with best rates guaranteed.',
      canonicalUrl: 'https://tropicanahotels.com/book'
    }
  ];

  for (const seo of seoSettings) {
    await prisma.seoSetting.create({
      data: seo
    });
  }

  // 33. Create Announcements
  const announcements = [
    {
      title: 'Grand Opening Special',
      content: 'Celebrate our grand opening with 30% off all bookings made this month!',
      type: 'success',
      showOnPages: ['homepage', 'properties', 'book'],
      position: 'top',
      isDismissible: true,
      backgroundColor: '#10B981',
      textColor: '#FFFFFF',
      startDate: today,
      endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isGuestVisible: true,
      isActive: true,
      priority: 1
    },
    {
      title: 'COVID-19 Safety Measures',
      content: 'We have enhanced our cleaning protocols and safety measures for your peace of mind.',
      type: 'info',
      showOnPages: ['all'],
      position: 'top',
      isDismissible: true,
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      isGuestVisible: true,
      isActive: true,
      priority: 0
    }
  ];

  for (const announcement of announcements) {
    await prisma.announcement.create({
      data: announcement
    });
  }

  // 34. Create Feedback Samples
  const feedbacks = [
    {
      content: 'The hotel service was excellent! The staff was very accommodating and the room was clean and comfortable.',
      category: FeedbackCategory.COMPLIMENT,
      sentiment: FeedbackSentiment.POSITIVE,
      status: FeedbackStatus.NEW,
      priority: FeedbackPriority.LOW
    },
    {
      content: 'The WiFi in my room was very slow. It made it difficult to work during my business trip.',
      category: FeedbackCategory.USABILITY_ISSUE,
      sentiment: FeedbackSentiment.NEGATIVE,
      status: FeedbackStatus.NEW,
      priority: FeedbackPriority.MEDIUM
    },
    {
      content: 'Could you add more vegetarian options to the breakfast menu? The current selection is quite limited.',
      category: FeedbackCategory.FEATURE_REQUEST,
      sentiment: FeedbackSentiment.NEUTRAL,
      status: FeedbackStatus.NEW,
      priority: FeedbackPriority.LOW
    },
    {
      content: 'The air conditioning in room 205 is not working properly. Please check and repair.',
      category: FeedbackCategory.USABILITY_ISSUE,
      sentiment: FeedbackSentiment.NEGATIVE,
      status: FeedbackStatus.IN_PROGRESS,
      priority: FeedbackPriority.HIGH
    }
  ];

  for (const feedback of feedbacks) {
    await prisma.feedback.create({
      data: feedback
    });
  }

  // 35. Create Search Index entries
  const searchIndexEntries = [
    {
      entityType: 'BusinessUnit',
      entityId: anchorHotel?.id || 'unknown',
      title: 'Anchor Hotel',
      content: 'Premium business hotel in the heart of General Santos City with modern amenities and exceptional service',
      keywords: ['anchor hotel', 'business hotel', 'general santos', 'premium accommodation'],
      url: '/properties/anchor-hotel',
      boost: 1.5
    }
  ];

  for (const entry of searchIndexEntries) {
    await prisma.searchIndex.create({
      data: entry
    });
  }

  console.log('✅ Comprehensive seed completed successfully!');
  console.log('');
  console.log('📊 Summary of created data:');
  console.log(`- Website Configuration: 1`);
  console.log(`- System Settings: ${systemSettings.length}`);
  console.log(`- Permissions: ${permissions.length}`);
  console.log(`- Roles: ${roles.length}`);
  console.log(`- Users: 1 (admin)`);
  console.log(`- Business Units: ${createdBusinessUnits.length}`);
  console.log(`- Departments: ${createdDepartments.length}`);
  console.log(`- Amenities: ${createdAmenities.length}`);
  console.log(`- Room Types: ${createdRoomTypes.length}`);
  console.log(`- Rooms: ${createdRooms.length}`);
  console.log(`- Room Rates: ${createdRoomTypes.length * 2}`);
  console.log(`- Services: ${createdServices.length}`);
  console.log(`- Guests: ${createdGuests.length}`);
  console.log(`- Special Offers: ${createdOffers.length}`);
  console.log(`- Restaurants: ${createdRestaurants.length}`);
  console.log(`- Events: ${createdEvents.length}`);
  console.log(`- Content Items: ${contentItems.length}`);
  console.log(`- Testimonials: ${createdTestimonials.length}`);
  console.log(`- FAQs: ${createdFAQs.length}`);
  console.log(`- Heroes: ${heroes.length}`);
  console.log(`- Media Items: ${createdImages.length}`);
  console.log(`- Promos: ${createdPromos.length}`);
  console.log(`- Vouchers: ${vouchers.length}`);
  console.log(`- Email Templates: ${emailTemplates.length}`);
  console.log(`- SEO Settings: ${seoSettings.length}`);
  console.log(`- Announcements: ${announcements.length}`);
  console.log(`- Feedback: ${feedbacks.length}`);
  console.log('');
  console.log('🔑 Admin Login Credentials:');
  console.log('Email: admin@tropicanahotels.com');
  console.log('Password: asdasd123');
  console.log('');
  console.log('🏨 Created Properties:');
  createdBusinessUnits.forEach(bu => {
    console.log(`- ${bu.displayName} (${bu.slug})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
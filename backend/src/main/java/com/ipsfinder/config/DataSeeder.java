package com.ipsfinder.config;

import com.ipsfinder.entity.*;
import com.ipsfinder.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PgListingRepository pgListingRepository;
    private final MessProfileRepository messProfileRepository;
    private final MenuItemRepository menuItemRepository;
    private final ReviewRepository reviewRepository;
    private final WishlistRepository wishlistRepository;
    private final InquiryRepository inquiryRepository;
    private final ReportRepository reportRepository;
    private final AnnouncementRepository announcementRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Database is empty. Starting seed data generation for StudentNest...");
            seedAll();
            log.info("Seed data generation completed successfully!");
        } else {
            log.info("Database already contains {} users. Skipping initial seed.", userRepository.count());
        }
    }

    @Transactional
    public void seedAll() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Users
        User admin = User.builder()
                .name("Admin IPS")
                .email("admin@ips.com")
                .phone("9876543210")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .blocked(false)
                .createdAt(now.minusMonths(3))
                .build();

        User owner1 = User.builder()
                .name("Ramesh Sharma")
                .email("owner@ips.com")
                .phone("9826011223")
                .passwordHash(passwordEncoder.encode("owner123"))
                .role(Role.PG_OWNER)
                .ownerBusinessName("Sharma Residency & Hostels")
                .blocked(false)
                .createdAt(now.minusMonths(2))
                .build();

        User owner2 = User.builder()
                .name("Sunil Verma")
                .email("pgowner2@ips.com")
                .phone("9826033445")
                .passwordHash(passwordEncoder.encode("owner123"))
                .role(Role.PG_OWNER)
                .ownerBusinessName("Verma Luxury Living")
                .blocked(false)
                .createdAt(now.minusMonths(2))
                .build();

        User owner3 = User.builder()
                .name("Anita Patel")
                .email("pgowner3@ips.com")
                .phone("9826055667")
                .passwordHash(passwordEncoder.encode("owner123"))
                .role(Role.PG_OWNER)
                .ownerBusinessName("Patel Girls PG & Rooms")
                .blocked(false)
                .createdAt(now.minusMonths(2))
                .build();

        User messOwner = User.builder()
                .name("Mahesh Joshi")
                .email("mess@ips.com")
                .phone("9826077889")
                .passwordHash(passwordEncoder.encode("mess123"))
                .role(Role.MESS_OWNER)
                .ownerBusinessName("Annapurna Tiffin & Mess Services")
                .blocked(false)
                .createdAt(now.minusMonths(2))
                .build();

        User student1 = User.builder()
                .name("Aman Gupta")
                .email("student@ips.com")
                .phone("9111223344")
                .passwordHash(passwordEncoder.encode("student123"))
                .role(Role.STUDENT)
                .college("IPS Academy, Institute of Engineering & Science")
                .course("B.Tech CSE 3rd Year")
                .homeCity("Bhopal")
                .blocked(false)
                .createdAt(now.minusMonths(1))
                .build();

        User student2 = User.builder()
                .name("Priya Sen")
                .email("student2@ips.com")
                .phone("9111334455")
                .passwordHash(passwordEncoder.encode("student123"))
                .role(Role.STUDENT)
                .college("IPS Academy, Indore")
                .course("BBA 2nd Year")
                .homeCity("Gwalior")
                .blocked(false)
                .createdAt(now.minusMonths(1))
                .build();

        userRepository.saveAll(List.of(admin, owner1, owner2, owner3, messOwner, student1, student2));

        // 2. 8 PG Listings
        // PG 1: Approved + verified, Bhawarkua, Boys
        PgListing pg1 = PgListing.builder()
                .owner(owner1)
                .title("Shree Krishna Boys PG - Near Bhawarkua Square")
                .description("Comfortable, clean and budget-friendly PG for college students. Located within walking distance from IPS bus stop and coaching centers. 24x7 water and high-speed Wi-Fi.")
                .type(PgType.PG)
                .rent(4800.0)
                .deposit(4800.0)
                .gender(Gender.BOYS)
                .sharing(SharingType.DOUBLE)
                .facilities(List.of("WIFI", "RO_WATER", "GEYSER", "LAUNDRY", "PARKING", "CCTV"))
                .rules("Main gate closes at 10:30 PM. No smoking or alcohol allowed inside rooms. Guests permitted in lobby only.")
                .images(List.of("/images/Pimage1.jpg", "/images/Pimage2.jpg"))
                .address("Plot 42, Professor Colony, Near Bhawarkua Tower, Indore")
                .lat(22.6934)
                .lng(75.8662)
                .availableBeds(3)
                .status(ListingStatus.APPROVED)
                .verified(true)
                .createdAt(now.minusDays(45))
                .lastUpdated(now.minusDays(5))
                .viewCount(142L)
                .build();

        // PG 2: Approved + verified, Khandwa Road (stale: updated 35 days ago!)
        PgListing pg2 = PgListing.builder()
                .owner(owner1)
                .title("IPS Campus View Boys Hostel")
                .description("Prime location right across Khandwa Road close to IPS Academy. Spacious rooms with attached bathrooms, study tables and wardrobes.")
                .type(PgType.HOSTEL)
                .rent(5500.0)
                .deposit(5000.0)
                .gender(Gender.BOYS)
                .sharing(SharingType.TRIPLE)
                .facilities(List.of("WIFI", "MEALS", "GEYSER", "RO_WATER", "POWER_BACKUP"))
                .rules("Mess timing breakfast 8-10 AM, dinner 8-10 PM. Quiet hours after 11 PM.")
                .images(List.of("/images/Himage1.jpg", "/images/Himage2.jpg"))
                .address("Lane 3, Opposite Crystal IT Park, Khandwa Road, Indore")
                .lat(22.6812)
                .lng(75.8750)
                .availableBeds(6)
                .status(ListingStatus.APPROVED)
                .verified(true)
                .createdAt(now.minusDays(60))
                .lastUpdated(now.minusDays(35)) // STALE listing (>30 days)
                .viewCount(98L)
                .build();

        // PG 3: Approved + verified, Rajendra Nagar, Girls
        PgListing pg3 = PgListing.builder()
                .owner(owner3)
                .title("Radha Rani Luxury Girls PG")
                .description("Safe and modern girls PG with biometric entry, full CCTV surveillance, air cooler/AC, and nutritious homely food available.")
                .type(PgType.PG)
                .rent(6800.0)
                .deposit(7000.0)
                .gender(Gender.GIRLS)
                .sharing(SharingType.DOUBLE)
                .facilities(List.of("WIFI", "AC", "MEALS", "GEYSER", "SECURITY", "LAUNDRY"))
                .rules("Curfew 9:30 PM. Male visitors strictly prohibited. Biometric entry compulsory.")
                .images(List.of("/images/Pimage3.jpg", "/images/Pimage4.jpg"))
                .address("Scheme 71, Near Cat Road, Rajendra Nagar, Indore")
                .lat(22.6845)
                .lng(75.8390)
                .availableBeds(2)
                .status(ListingStatus.APPROVED)
                .verified(true)
                .createdAt(now.minusDays(20))
                .lastUpdated(now.minusDays(2))
                .viewCount(210L)
                .build();

        // PG 4: Approved + verified, Vishnu Puri, Flat
        PgListing pg4 = PgListing.builder()
                .owner(owner2)
                .title("2BHK Fully Furnished Student Flat")
                .description("Fully furnished 2BHK flat suitable for 4 students sharing. Includes modular kitchen with gas stove, refrigerator, water purifier, and beds.")
                .type(PgType.FLAT)
                .rent(8500.0)
                .deposit(10000.0)
                .gender(Gender.ANY)
                .sharing(SharingType.DOUBLE)
                .facilities(List.of("WIFI", "PARKING", "RO_WATER", "GEYSER", "REFRIGERATOR"))
                .rules("Electricity bill as per meter reading. Families or student groups welcome.")
                .images(List.of("/images/Pimage5.jpg"))
                .address("B-12 Vishnu Puri NX, AB Road, Indore")
                .lat(22.6975)
                .lng(75.8640)
                .availableBeds(4)
                .status(ListingStatus.APPROVED)
                .verified(true)
                .createdAt(now.minusDays(15))
                .lastUpdated(now.minusDays(1))
                .viewCount(84L)
                .build();

        // PG 5: Approved + verified, Sapna Sangeeta, Single room
        PgListing pg5 = PgListing.builder()
                .owner(owner2)
                .title("Elite Single Occupancy Room for Students")
                .description("Private single rooms designed for focused studying. High-speed fiber internet, peaceful residential locality with easy commute to IPS.")
                .type(PgType.PG)
                .rent(7500.0)
                .deposit(7500.0)
                .gender(Gender.BOYS)
                .sharing(SharingType.SINGLE)
                .facilities(List.of("WIFI", "AC", "GEYSER", "RO_WATER", "DAILY_CLEANING"))
                .rules("No loud music. Visitors allowed until 8 PM.")
                .images(List.of("/images/Pimage6.jpg"))
                .address("15 Sneha Nagar, Near Sapna Sangeeta Inox, Indore")
                .lat(22.7032)
                .lng(75.8744)
                .availableBeds(1)
                .status(ListingStatus.APPROVED)
                .verified(true)
                .createdAt(now.minusDays(10))
                .lastUpdated(now.minusDays(3))
                .viewCount(165L)
                .build();

        // PG 6: PENDING 1, Rau / Silicon City
        PgListing pg6 = PgListing.builder()
                .owner(owner1)
                .title("Silicon City Affordable PG")
                .description("Brand new PG setup near Silicon City entrance, 10 min drive to IPS Academy. Modern tiles, wooden wardrobes.")
                .type(PgType.PG)
                .rent(3800.0)
                .deposit(3800.0)
                .gender(Gender.BOYS)
                .sharing(SharingType.TRIPLE)
                .facilities(List.of("WIFI", "RO_WATER", "PARKING"))
                .rules("Entry before 10 PM.")
                .images(List.of("/images/Pimage7.jpg"))
                .address("Sector B, Silicon City, Rau, Indore")
                .lat(22.6570)
                .lng(75.8230)
                .availableBeds(8)
                .status(ListingStatus.PENDING)
                .verified(false)
                .createdAt(now.minusDays(2))
                .lastUpdated(now.minusDays(2))
                .viewCount(12L)
                .build();

        // PG 7: PENDING 2, Annapurna Road Girls Hostel
        PgListing pg7 = PgListing.builder()
                .owner(owner3)
                .title("Saraswati Girls Hostel Annapurna")
                .description("Hostel with warden facility, hygienic mess and biometric attendance.")
                .type(PgType.HOSTEL)
                .rent(6200.0)
                .deposit(6000.0)
                .gender(Gender.GIRLS)
                .sharing(SharingType.DOUBLE)
                .facilities(List.of("WIFI", "MEALS", "SECURITY", "GEYSER"))
                .rules("Late night entry strictly on parent approval.")
                .images(List.of("/images/Himage3.jpg"))
                .address("Near Annapurna Temple, Indore")
                .lat(22.7020)
                .lng(75.8450)
                .availableBeds(5)
                .status(ListingStatus.PENDING)
                .verified(false)
                .createdAt(now.minusDays(1))
                .lastUpdated(now.minusDays(1))
                .viewCount(5L)
                .build();

        // PG 8: REJECTED, Vijay Nagar (Far away & incomplete details)
        PgListing pg8 = PgListing.builder()
                .owner(owner2)
                .title("Vijay Nagar Budget Rooms")
                .description("Low cost rooms available in Scheme 54.")
                .type(PgType.PG)
                .rent(3500.0)
                .deposit(2000.0)
                .gender(Gender.ANY)
                .sharing(SharingType.TRIPLE)
                .facilities(List.of("RO_WATER"))
                .rules("None")
                .images(List.of("/images/Pimage8.jpg"))
                .address("Scheme 54, Vijay Nagar, Indore")
                .lat(22.7533)
                .lng(75.8937)
                .availableBeds(0)
                .status(ListingStatus.REJECTED)
                .verified(false)
                .rejectionReason("Incomplete documentation and unclear room photos provided. Location is also outside the campus zone.")
                .createdAt(now.minusDays(8))
                .lastUpdated(now.minusDays(7))
                .viewCount(19L)
                .build();

        pgListingRepository.saveAll(List.of(pg1, pg2, pg3, pg4, pg5, pg6, pg7, pg8));

        // 3. 3 Messes (veg, non-veg, both) - 2 approved, 1 pending
        // Mess 1: Approved, VEG, Bhawarkua
        MessProfile mess1 = MessProfile.builder()
                .owner(messOwner)
                .name("Maa Annapurna Shuddh Shakahari Mess")
                .description("100% Pure vegetarian North Indian and MP style home cooked food. Unlimited thali system with freshly prepared rotis, dal, seasonal sabzi, rice, and salad. Special sweet on Sundays!")
                .foodType(FoodType.VEG)
                .openTime("07:30 AM")
                .closeTime("10:30 PM")
                .pricePerMeal(80.0)
                .monthlyPrice(2400.0)
                .deliveryCharge(0.0)
                .deliveryArea("Bhawarkua, Vishnupuri, IPS Campus Road")
                .address("12 Bholaram Ustad Marg, Bhawarkua, Indore")
                .lat(22.6950)
                .lng(75.8670)
                .images(List.of("/images/Mimage1.jpg"))
                .isOpen(true)
                .status(ListingStatus.APPROVED)
                .verified(true)
                .createdAt(now.minusDays(50))
                .lastUpdated(now.minusDays(3))
                .build();

        // Mess 2: Approved, BOTH (Veg + Non-Veg), Rajendra Nagar
        MessProfile mess2 = MessProfile.builder()
                .owner(owner1)
                .name("Malwa Zaika Tiffin Center")
                .description("Delicious daily tiffin delivery right to your PG room. Veg meals daily, with optional Non-Veg thali on Wednesday and Sunday. Clean packaging and hot delivery.")
                .foodType(FoodType.BOTH)
                .openTime("08:00 AM")
                .closeTime("10:00 PM")
                .pricePerMeal(95.0)
                .monthlyPrice(2800.0)
                .deliveryCharge(15.0)
                .deliveryArea("Rajendra Nagar, AB Road, IPS Academy Hostel Area")
                .address("Shop 4, Annapurna Commercial Complex, Rajendra Nagar, Indore")
                .lat(22.6860)
                .lng(75.8410)
                .images(List.of("/images/Mimage2.jpg"))
                .isOpen(true)
                .status(ListingStatus.APPROVED)
                .verified(true)
                .createdAt(now.minusDays(40))
                .lastUpdated(now.minusDays(4))
                .build();

        // Mess 3: PENDING, NONVEG
        MessProfile mess3 = MessProfile.builder()
                .owner(owner2)
                .name("Kolhapuri & Mughlai Non-Veg Kitchen")
                .description("Special non-veg student meals, chicken curry, mutton biryani, and egg thali.")
                .foodType(FoodType.NONVEG)
                .openTime("12:00 PM")
                .closeTime("11:00 PM")
                .pricePerMeal(120.0)
                .monthlyPrice(3400.0)
                .deliveryCharge(20.0)
                .deliveryArea("Bhawarkua, Navlakha, Bhanwarkuan")
                .address("Transport Nagar Road, Near Navlakha, Indore")
                .lat(22.6990)
                .lng(75.8750)
                .images(List.of("/images/Mimage3.jpg"))
                .isOpen(true)
                .status(ListingStatus.PENDING)
                .verified(false)
                .createdAt(now.minusDays(4))
                .lastUpdated(now.minusDays(4))
                .build();

        messProfileRepository.saveAll(List.of(mess1, mess2, mess3));

        // 4. Weekly Menu items for Mess 1 and Mess 2
        MenuItem m1 = MenuItem.builder().mess(mess1).name("Poha Jalebi & Tea").foodType(FoodType.VEG).dayOfWeek(DayOfWeek.ALL).mealType(MealType.BREAKFAST).price(40.0).build();
        MenuItem m2 = MenuItem.builder().mess(mess1).name("Dal Tadka, Paneer Butter Masala, 4 Butter Roti, Rice").foodType(FoodType.VEG).dayOfWeek(DayOfWeek.MON).mealType(MealType.LUNCH).price(80.0).build();
        MenuItem m3 = MenuItem.builder().mess(mess1).name("Sev Tamatar, Chana Masala, Tawa Roti, Jeera Rice").foodType(FoodType.VEG).dayOfWeek(DayOfWeek.MON).mealType(MealType.DINNER).price(80.0).build();
        MenuItem m4 = MenuItem.builder().mess(mess1).name("Chole Bhature Special").foodType(FoodType.VEG).dayOfWeek(DayOfWeek.SUN).mealType(MealType.LUNCH).price(90.0).build();
        MenuItem m5 = MenuItem.builder().mess(mess1).name("Gulab Jamun (2 pcs)").foodType(FoodType.VEG).dayOfWeek(DayOfWeek.SUN).mealType(MealType.DINNER).price(30.0).build();

        MenuItem m6 = MenuItem.builder().mess(mess2).name("Aloo Paratha with Curd & Pickle").foodType(FoodType.VEG).dayOfWeek(DayOfWeek.ALL).mealType(MealType.BREAKFAST).price(50.0).build();
        MenuItem m7 = MenuItem.builder().mess(mess2).name("Egg Curry (2 Eggs) with Steamed Rice & 4 Chapatis").foodType(FoodType.NONVEG).dayOfWeek(DayOfWeek.WED).mealType(MealType.DINNER).price(100.0).build();
        MenuItem m8 = MenuItem.builder().mess(mess2).name("Desi Chicken Thali (3 pcs Chicken + Gravy + Rice + Roti)").foodType(FoodType.NONVEG).dayOfWeek(DayOfWeek.SUN).mealType(MealType.LUNCH).price(140.0).build();
        MenuItem m9 = MenuItem.builder().mess(mess2).name("Special Dal Bafla Thali").foodType(FoodType.VEG).dayOfWeek(DayOfWeek.SUN).mealType(MealType.LUNCH).price(110.0).build();

        menuItemRepository.saveAll(List.of(m1, m2, m3, m4, m5, m6, m7, m8, m9));

        // 5. ~12 Reviews
        Review r1 = Review.builder().student(student1).targetType(TargetType.PG).targetId(pg1.getId()).rating(5)
                .comment("Excellent PG! Sharma ji takes care of everything. Wi-Fi speed is 100 Mbps, very convenient for online classes.")
                .ownerReply("Thank you Aman! We are always happy to help our student guests.")
                .createdAt(now.minusDays(15)).build();

        Review r2 = Review.builder().student(student2).targetType(TargetType.PG).targetId(pg3.getId()).rating(5)
                .comment("Super safe girls PG. The warden is very polite and biometric system gives safety peace of mind.")
                .ownerReply("Thanks Priya for the review. Safety of our students is priority.")
                .createdAt(now.minusDays(12)).build();

        Review r3 = Review.builder().student(student1).targetType(TargetType.PG).targetId(pg2.getId()).rating(4)
                .comment("Great proximity to IPS Academy. Food in hostel mess is decent.")
                .createdAt(now.minusDays(10)).build();

        Review r4 = Review.builder().student(student2).targetType(TargetType.PG).targetId(pg4.getId()).rating(4)
                .comment("Flat is clean and spacious. Nice society with quiet neighbors.")
                .createdAt(now.minusDays(8)).build();

        Review r5 = Review.builder().student(student1).targetType(TargetType.PG).targetId(pg5.getId()).rating(5)
                .comment("Best single room in Indore. AC works well in summer.")
                .createdAt(now.minusDays(6)).build();

        Review r6 = Review.builder().student(student1).targetType(TargetType.MESS).targetId(mess1.getId()).rating(5)
                .comment("Homely food, no extra soda or oil. Best vegetarian mess in Bhawarkua area!")
                .ownerReply("Radhe Radhe! Glad you like our home-style cooking.")
                .createdAt(now.minusDays(14)).build();

        Review r7 = Review.builder().student(student2).targetType(TargetType.MESS).targetId(mess1.getId()).rating(4)
                .comment("Very good tiffin service. Delivered on time before our college bus.")
                .createdAt(now.minusDays(9)).build();

        Review r8 = Review.builder().student(student1).targetType(TargetType.MESS).targetId(mess2.getId()).rating(5)
                .comment("The Sunday chicken curry is mouth-watering. Great tiffin packaging.")
                .createdAt(now.minusDays(5)).build();

        Review r9 = Review.builder().student(student2).targetType(TargetType.MESS).targetId(mess2.getId()).rating(4)
                .comment("Veg food is tasty too. Malwa dal bafla on Sunday is delicious.")
                .createdAt(now.minusDays(4)).build();

        Review r10 = Review.builder().student(student2).targetType(TargetType.PG).targetId(pg1.getId()).rating(4)
                .comment("Visited for brother's admission. Very disciplined environment.")
                .createdAt(now.minusDays(3)).build();

        Review r11 = Review.builder().student(student1).targetType(TargetType.PG).targetId(pg4.getId()).rating(4)
                .comment("Good amenities, RO and geyser working properly.")
                .createdAt(now.minusDays(2)).build();

        Review r12 = Review.builder().student(student2).targetType(TargetType.PG).targetId(pg5.getId()).rating(5)
                .comment("Quiet locality, good for exam preparation.")
                .createdAt(now.minusDays(1)).build();

        reviewRepository.saveAll(List.of(r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12));

        // 6. Wishlist entries
        Wishlist w1 = Wishlist.builder().student(student1).targetType(TargetType.PG).targetId(pg3.getId()).createdAt(now.minusDays(10)).build();
        Wishlist w2 = Wishlist.builder().student(student1).targetType(TargetType.MESS).targetId(mess1.getId()).createdAt(now.minusDays(8)).build();
        Wishlist w3 = Wishlist.builder().student(student2).targetType(TargetType.PG).targetId(pg1.getId()).createdAt(now.minusDays(5)).build();
        wishlistRepository.saveAll(List.of(w1, w2, w3));

        // 7. 4 Inquiries
        Inquiry inq1 = Inquiry.builder()
                .student(student1)
                .targetType(TargetType.PG)
                .targetId(pg1.getId())
                .owner(owner1)
                .message("Hi, is double sharing room available for immediate shifting from next Monday?")
                .status(InquiryStatus.CONTACTED)
                .createdAt(now.minusDays(5))
                .build();

        Inquiry inq2 = Inquiry.builder()
                .student(student2)
                .targetType(TargetType.PG)
                .targetId(pg3.getId())
                .owner(owner3)
                .message("Hello, what is the gate timing on weekends for girls PG? And is laundry included in rent?")
                .status(InquiryStatus.NEW)
                .createdAt(now.minusDays(2))
                .build();

        Inquiry inq3 = Inquiry.builder()
                .student(student1)
                .targetType(TargetType.MESS)
                .targetId(mess1.getId())
                .owner(messOwner)
                .message("Do you deliver morning breakfast tiffins to Khandwa Road near IPS Academy gate?")
                .status(InquiryStatus.NEW)
                .createdAt(now.minusDays(1))
                .build();

        Inquiry inq4 = Inquiry.builder()
                .student(student2)
                .targetType(TargetType.MESS)
                .targetId(mess2.getId())
                .owner(owner1)
                .message("Can I take a 3-day trial subscription before paying for the whole month?")
                .status(InquiryStatus.CONTACTED)
                .createdAt(now.minusDays(3))
                .build();

        inquiryRepository.saveAll(List.of(inq1, inq2, inq3, inq4));

        // 8. 2 Reports
        Report rep1 = Report.builder()
                .reporter(student1)
                .targetType(TargetType.PG)
                .targetId(pg8.getId())
                .reason("Listing photos look fake and address given was incorrect when visited.")
                .status(ReportStatus.RESOLVED)
                .createdAt(now.minusDays(9))
                .build();

        Report rep2 = Report.builder()
                .reporter(student2)
                .targetType(TargetType.MESS)
                .targetId(mess2.getId())
                .reason("Delivery was delayed by 1 hour on Monday due to rain.")
                .status(ReportStatus.OPEN)
                .createdAt(now.minusDays(2))
                .build();

        reportRepository.saveAll(List.of(rep1, rep2));

        // 9. 2 Announcements
        Announcement a1 = Announcement.builder()
                .title("Welcome to StudentNest Portal!")
                .content("Welcome IPSians! You can now easily explore verified PGs, hostels, flats, and mess services near IPS Academy Indore campus. Check distances, reviews, and contact owners directly.")
                .createdAt(now.minusDays(30))
                .build();

        Announcement a2 = Announcement.builder()
                .title("Campus Safety & Mess Hygiene Guidelines 2026")
                .content("Students are advised to always visit the PG before paying security deposits. All mess listings marked with 'Verified' adhere to FSSAI hygiene standards. For any discrepancies, use the Report button.")
                .createdAt(now.minusDays(10))
                .build();

        announcementRepository.saveAll(List.of(a1, a2));
    }
}

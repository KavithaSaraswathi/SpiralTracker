package com.spiraltrack.config;

import com.spiraltrack.dto.OrderRequest;
import com.spiraltrack.entity.Student;
import com.spiraltrack.entity.Subject;
import com.spiraltrack.repository.OrderRepository;
import com.spiraltrack.repository.StudentRepository;
import com.spiraltrack.repository.SubjectRepository;
import com.spiraltrack.service.OrderService;
import com.spiraltrack.service.StudentService;
import com.spiraltrack.service.SubjectService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class SeedDataLoader {

    private static final Logger log = LoggerFactory.getLogger(SeedDataLoader.class);

    @Bean
    @ConditionalOnProperty(name = "spiraltrack.seed.enabled", havingValue = "true")
    public CommandLineRunner seedDatabase(StudentRepository studentRepository,
                                          SubjectRepository subjectRepository,
                                          OrderRepository orderRepository,
                                          StudentService studentService,
                                          SubjectService subjectService,
                                          OrderService orderService) {
        return args -> {
            log.info("Checking database for seed data...");
            if (studentRepository.count() > 0) {
                log.info("Database already contains data. Skipping sample data seed.");
                return;
            }

            log.info("Seeding development sample data...");

            // Subjects
            subjectService.getOrCreateSubject("OS", "Operating Systems notes", new BigDecimal("140.00"));
            subjectService.getOrCreateSubject("GP", "Graphics Programming materials", new BigDecimal("15.00"));
            subjectService.getOrCreateSubject("OOPS", "Object Oriented Programming Java", new BigDecimal("30.00"));
            subjectRepository.findByNameIgnoreCase("DS").orElseGet(() ->
                    subjectRepository.save(new Subject("DS", "Data Structures & Algorithms")));

            // Students
            studentService.getOrCreateStudent("Samima", "9876543210");
            studentService.getOrCreateStudent("Kavi", "9876543211");
            studentService.getOrCreateStudent("Maha S", "9876543212");
            studentService.getOrCreateStudent("Karthikeyan", "9876543213");
            studentService.getOrCreateStudent("Harish S", "9876543214");

            // 1. Samima - OS - 85 pages - ₹140 - ₹0 paid - Pending - ORDERED
            OrderRequest order1 = new OrderRequest();
            order1.setStudentName("Samima");
            order1.setSubjectName("OS");
            order1.setPages(85);
            order1.setQuantity(1);
            order1.setTotalAmount(new BigDecimal("140.00"));
            order1.setAmountPaid(new BigDecimal("0.00"));
            order1.setDeliveryStatus("ORDERED");
            order1.setOrderDate(LocalDate.now());
            order1.setNotes("Classnotes Units 1-3");
            orderService.createOrder(order1);

            // 2. Kavi - GP - 37 pages - ₹15 - ₹15 paid - Paid - RECEIVED
            OrderRequest order2 = new OrderRequest();
            order2.setStudentName("Kavi");
            order2.setSubjectName("GP");
            order2.setPages(37);
            order2.setQuantity(1);
            order2.setTotalAmount(new BigDecimal("15.00"));
            order2.setAmountPaid(new BigDecimal("15.00"));
            order2.setDeliveryStatus("RECEIVED");
            order2.setOrderDate(LocalDate.now());
            order2.setNotes("Paid via UPI");
            orderService.createOrder(order2);

            // 3. Maha S - GP - 37 pages - ₹15 - ₹10 paid - Partial (₹5 pending) - READY
            OrderRequest order3 = new OrderRequest();
            order3.setStudentName("Maha S");
            order3.setSubjectName("GP");
            order3.setPages(37);
            order3.setQuantity(1);
            order3.setTotalAmount(new BigDecimal("15.00"));
            order3.setAmountPaid(new BigDecimal("10.00"));
            order3.setDeliveryStatus("READY");
            order3.setOrderDate(LocalDate.now());
            order3.setNotes("Ready for pickup");
            orderService.createOrder(order3);

            // 4. Karthikeyan - OOPS - 108 pages - ₹30 - ₹10 paid - Partial (₹20 pending) - ORDERED
            OrderRequest order4 = new OrderRequest();
            order4.setStudentName("Karthikeyan");
            order4.setSubjectName("OOPS");
            order4.setPages(108);
            order4.setQuantity(1);
            order4.setTotalAmount(new BigDecimal("30.00"));
            order4.setAmountPaid(new BigDecimal("10.00"));
            order4.setDeliveryStatus("ORDERED");
            order4.setOrderDate(LocalDate.now());
            order4.setNotes("Lab Manual copy");
            orderService.createOrder(order4);

            log.info("Development sample data seeded successfully.");
        };
    }
}

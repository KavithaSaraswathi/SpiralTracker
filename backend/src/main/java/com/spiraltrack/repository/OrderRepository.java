package com.spiraltrack.repository;

import com.spiraltrack.entity.Order;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = "payments")
    List<Order> findAllByArchivedFalseOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = "payments")
    List<Order> findAllByArchivedTrueOrderByCompletedAtDesc();

    @EntityGraph(attributePaths = "payments")
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findDetailedById(@Param("id") Long id);

    @EntityGraph(attributePaths = "payments")
    @Query("SELECT o FROM Order o WHERE o.archived = false AND o.student.id = :studentId ORDER BY o.createdAt DESC")
    List<Order> findActiveByStudentId(@Param("studentId") Long studentId);

    @EntityGraph(attributePaths = "payments")
    @Query("SELECT o FROM Order o WHERE o.archived = false AND o.subject.id = :subjectId ORDER BY o.createdAt DESC")
    List<Order> findActiveBySubjectId(@Param("subjectId") Long subjectId);

    @EntityGraph(attributePaths = "payments")
    @Query("SELECT o FROM Order o WHERE o.archived = false AND " +
           "(LOWER(o.student.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(o.subject.name) LIKE LOWER(CONCAT('%', :query, '%'))) ORDER BY o.createdAt DESC")
    List<Order> searchActiveOrders(@Param("query") String query);

    @EntityGraph(attributePaths = "payments")
    List<Order> findAllByArchivedFalseAndPaymentStatusIgnoreCaseOrderByCreatedAtDesc(String paymentStatus);

    @EntityGraph(attributePaths = "payments")
    List<Order> findAllByArchivedFalseAndPaymentStatusNotIgnoreCaseOrderByCreatedAtDesc(String paymentStatus);

    @EntityGraph(attributePaths = "payments")
    List<Order> findAllByArchivedFalseAndDeliveryStatusIgnoreCaseOrderByCreatedAtDesc(String deliveryStatus);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Long id);

    long countByOrderDate(LocalDate orderDate);

    long countByArchivedFalse();

    long countByArchivedTrue();

    long countByArchivedFalseAndDeliveryStatusIgnoreCase(String deliveryStatus);

    long countByArchivedFalseAndPaymentStatusNotIgnoreCaseAndDeliveryStatusIgnoreCase(String paymentStatus, String deliveryStatus);

    @Query("SELECT COALESCE(SUM(o.quantity), 0) FROM Order o WHERE o.archived = false AND o.deliveryStatus = :status")
    Long sumActiveCopiesByDeliveryStatus(@Param("status") String status);

    @Query("SELECT COALESCE(SUM(o.quantity), 0) FROM Order o WHERE o.archived = false")
    Long sumActiveCopies();

    @Query("SELECT COALESCE(SUM(o.quantity), 0) FROM Order o WHERE o.archived = true")
    Long sumArchivedCopies();

    @Query("SELECT COALESCE(SUM(o.totalAmount - o.amountPaid), 0) FROM Order o WHERE o.paymentStatus <> 'PAID'")
    BigDecimal sumTotalOutstanding();
}

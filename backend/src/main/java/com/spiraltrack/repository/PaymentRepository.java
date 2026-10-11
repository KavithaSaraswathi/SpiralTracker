package com.spiraltrack.repository;

import com.spiraltrack.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByOrderIdOrderByPaymentDateAscIdAsc(Long orderId);
    boolean existsByOrderId(Long orderId);
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE UPPER(p.paymentMethod) = :method")
    BigDecimal sumAmountByPaymentMethod(@Param("method") String method);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p")
    BigDecimal sumAllPayments();
}

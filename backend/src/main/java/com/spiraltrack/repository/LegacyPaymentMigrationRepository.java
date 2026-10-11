package com.spiraltrack.repository;

import com.spiraltrack.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LegacyPaymentMigrationRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o WHERE o.amountPaid > 0 AND o.payments IS EMPTY")
    List<Order> findOrdersWithUnreconciledPayments();
}

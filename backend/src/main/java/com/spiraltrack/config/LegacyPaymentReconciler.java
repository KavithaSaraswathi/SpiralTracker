package com.spiraltrack.config;

import com.spiraltrack.service.OrderService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class LegacyPaymentReconciler implements ApplicationRunner {

    private final OrderService orderService;

    public LegacyPaymentReconciler(OrderService orderService) {
        this.orderService = orderService;
    }

    @Override
    public void run(ApplicationArguments args) {
        orderService.reconcileLegacyPayments();
    }
}

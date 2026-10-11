package com.spiraltrack.service;

import com.spiraltrack.dto.DashboardResponse;
import com.spiraltrack.entity.Order;
import com.spiraltrack.repository.OrderRepository;
import com.spiraltrack.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public DashboardService(OrderRepository orderRepository, PaymentRepository paymentRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    public DashboardResponse getDashboardData() {
        DashboardResponse response = new DashboardResponse();

        long totalOrders = orderRepository.countByArchivedFalse();
        Long totalCopies = orderRepository.sumActiveCopies();
        long awaitingDelivery = orderRepository.countByArchivedFalseAndDeliveryStatusIgnoreCase("ORDERED");
        long readyForCollection = orderRepository.countByArchivedFalseAndDeliveryStatusIgnoreCase("READY");
        long receivedByStudents = orderRepository.countByArchivedFalseAndDeliveryStatusIgnoreCase("RECEIVED");
        long receivedNotFullyPaid = orderRepository.countByArchivedFalseAndPaymentStatusNotIgnoreCaseAndDeliveryStatusIgnoreCase("PAID", "RECEIVED");

        BigDecimal totalCollected = paymentRepository.sumAllPayments();
        if (totalCollected == null) totalCollected = BigDecimal.ZERO;
        BigDecimal cashCollected = paymentRepository.sumAmountByPaymentMethod("CASH");
        BigDecimal gpayCollected = paymentRepository.sumAmountByPaymentMethod("GPAY");

        BigDecimal totalOutstanding = orderRepository.sumTotalOutstanding();
        if (totalOutstanding == null) totalOutstanding = BigDecimal.ZERO;

        List<Order> pendingOrders = orderRepository.findAllByArchivedFalseAndPaymentStatusNotIgnoreCaseOrderByCreatedAtDesc("PAID");

        List<DashboardResponse.PendingPaymentSummary> pendingSummaries = pendingOrders.stream()
                .map(o -> new DashboardResponse.PendingPaymentSummary(
                        o.getId(),
                        o.getStudent() != null ? o.getStudent().getId() : null,
                        o.getStudent() != null ? o.getStudent().getName() : "Unknown",
                        o.getSubject() != null ? o.getSubject().getId() : null,
                        o.getSubject() != null ? o.getSubject().getName() : "Unknown",
                        o.getQuantity(),
                        o.getTotalAmount(),
                        o.getAmountPaid(),
                        o.getRemainingAmount(),
                        o.getDeliveryStatus(),
                        o.getPaymentStatus()
                ))
                .collect(Collectors.toList());

        response.setTotalOrderRecords(totalOrders);
        response.setTotalCopiesOrdered(totalCopies != null ? totalCopies : 0);
        response.setOrdersAwaitingDelivery(awaitingDelivery);
        response.setOrdersReadyForCollection(readyForCollection);
        response.setBooksReceivedByStudents(receivedByStudents);
        response.setTotalAmountCollected(totalCollected);
        response.setTotalOutstandingAmount(totalOutstanding);
        response.setCashCollected(cashCollected != null ? cashCollected : BigDecimal.ZERO);
        response.setGpayCollected(gpayCollected != null ? gpayCollected : BigDecimal.ZERO);
        response.setReceivedButNotFullyPaid(receivedNotFullyPaid);
        response.setHistoricalOrderRecords(orderRepository.countByArchivedTrue());
        Long historicalCopies = orderRepository.sumArchivedCopies();
        response.setHistoricalCopies(historicalCopies != null ? historicalCopies : 0);
        response.setPendingPayments(pendingSummaries);

        return response;
    }
}

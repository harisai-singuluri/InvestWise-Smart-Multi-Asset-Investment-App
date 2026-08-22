package com.investwise.ledger.controller;

import com.investwise.common.response.ApiResponse;
import com.investwise.ledger.dto.LedgerEntryResponse;
import com.investwise.ledger.dto.TransactionResponse;
import com.investwise.ledger.service.LedgerService;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Transactions & Ledger", description = "Endpoints for immutable trade history, CSV statements, and double-entry accounting records")
public class LedgerController {

    private final LedgerService ledgerService;
    private final UserService userService;

    @GetMapping("/transactions")
    @Operation(summary = "Get immutable executed trade history")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactions(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        List<TransactionResponse> transactions = ledgerService.getUserTransactions(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(transactions));
    }

    @GetMapping("/ledger")
    @Operation(summary = "Get double-entry accounting ledger entries")
    public ResponseEntity<ApiResponse<List<LedgerEntryResponse>>> getLedgerEntries(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userService.getUserByEmail(userDetails.getUsername());
        List<LedgerEntryResponse> ledger = ledgerService.getUserLedgerEntries(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(ledger));
    }

    @GetMapping("/transactions/export/csv")
    @Operation(summary = "Download verified CSV statement of account transactions")
    public ResponseEntity<byte[]> exportTransactionsCsv(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        List<TransactionResponse> transactions = ledgerService.getUserTransactions(user.getId());

        StringBuilder csv = new StringBuilder();
        csv.append("Transaction ID,Order ID,Asset Symbol,Asset Name,Side,Quantity,Execution Price,Total Amount (USD),Fee (USD),Timestamp\n");

        for (TransactionResponse tx : transactions) {
            csv.append(String.format("%d,%d,%s,\"%s\",%s,%s,%s,%s,%s,%s\n",
                    tx.getId(),
                    tx.getOrderId(),
                    tx.getAssetSymbol(),
                    tx.getAssetName(),
                    tx.getSide(),
                    tx.getQuantity(),
                    tx.getExecutionPrice(),
                    tx.getTotalAmount(),
                    tx.getFee(),
                    tx.getTimestamp()));
        }

        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        String filename = "InvestWise_Statement_" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}

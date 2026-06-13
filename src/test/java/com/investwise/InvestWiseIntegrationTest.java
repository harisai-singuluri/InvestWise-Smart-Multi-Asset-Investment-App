package com.investwise;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.investwise.auth.dto.AuthRequest;
import com.investwise.auth.dto.RegisterRequest;
import com.investwise.goal.dto.GoalRequest;
import com.investwise.order.dto.OrderRequest;
import com.investwise.order.entity.OrderSide;
import com.investwise.order.entity.OrderType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class InvestWiseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void completeUserInvestmentLifecycle() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .fullName("Sarah Jenkins")
                .email("sarah.jenkins@pluang-investwise.test")
                .password("SecureFintechPass123!")
                .build();

        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andReturn();

        String responseBody = registerResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseBody).path("data").path("token").asText();
        String authHeader = "Bearer " + token;

        mockMvc.perform(get("/api/v1/accounts")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalBalance", is(100000.0000)))
                .andExpect(jsonPath("$.data.availableCash", is(100000.0000)));

        mockMvc.perform(get("/api/v1/assets")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(10))));

        OrderRequest buyOrder = OrderRequest.builder()
                .symbol("AAPL")
                .side(OrderSide.BUY)
                .type(OrderType.MARKET)
                .quantity(new BigDecimal("10.000000"))
                .idempotencyKey("sarah-aapl-buy-001")
                .build();

        mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buyOrder)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status", is("FILLED")))
                .andExpect(jsonPath("$.data.symbol", is("AAPL")));

        mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buyOrder)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.idempotencyKey", is("sarah-aapl-buy-001")));

        mockMvc.perform(get("/api/v1/portfolio")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.holdings", hasSize(1)))
                .andExpect(jsonPath("$.data.holdings[0].symbol", is("AAPL")));

        mockMvc.perform(get("/api/v1/transactions")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));

        mockMvc.perform(get("/api/v1/ledger")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)));

        GoalRequest goalRequest = GoalRequest.builder()
                .title("Retirement Seed")
                .targetAmount(new BigDecimal("200000.0000"))
                .initialContribution(new BigDecimal("5000.0000"))
                .targetDate(LocalDate.now().plusYears(5))
                .build();

        mockMvc.perform(post("/api/v1/goals")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(goalRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title", is("Retirement Seed")));

        mockMvc.perform(get("/api/v1/insights")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }
}

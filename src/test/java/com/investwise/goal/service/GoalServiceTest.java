package com.investwise.goal.service;

import com.investwise.account.service.AccountService;
import com.investwise.goal.dto.GoalRequest;
import com.investwise.goal.dto.GoalResponse;
import com.investwise.goal.entity.GoalStatus;
import com.investwise.goal.entity.InvestmentGoal;
import com.investwise.goal.entity.RiskProfile;
import com.investwise.goal.repository.GoalRepository;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoalServiceTest {

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private UserService userService;

    @Mock
    private AccountService accountService;

    @InjectMocks
    private GoalService goalService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder().id(1L).email("alex@investwise.app").build();
    }

    @Test
    void createGoal_CalculatesProgressAndDebitsInitialContribution() {
        GoalRequest request = GoalRequest.builder()
                .title("Down Payment")
                .targetAmount(new BigDecimal("50000.0000"))
                .initialContribution(new BigDecimal("10000.0000"))
                .targetDate(LocalDate.now().plusYears(2))
                .riskProfile(RiskProfile.MODERATE)
                .build();

        when(userService.getUserById(1L)).thenReturn(sampleUser);
        when(goalRepository.save(any(InvestmentGoal.class))).thenAnswer(invocation -> {
            InvestmentGoal g = invocation.getArgument(0);
            g.setId(10L);
            return g;
        });

        GoalResponse response = goalService.createGoal(1L, request);

        assertNotNull(response);
        assertEquals("Down Payment", response.getTitle());
        assertEquals(new BigDecimal("10000.0000"), response.getCurrentAmount());
        assertEquals(new BigDecimal("20.00"), response.getProgressPercentage());
        assertEquals(GoalStatus.ACTIVE, response.getStatus());
        verify(accountService).debitAvailableCash(1L, new BigDecimal("10000.0000"));
    }
}

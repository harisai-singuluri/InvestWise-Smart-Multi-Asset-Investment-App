package com.investwise.goal.service;

import com.investwise.account.service.AccountService;
import com.investwise.common.exception.ResourceNotFoundException;
import com.investwise.common.exception.UnauthorizedException;
import com.investwise.goal.dto.GoalRequest;
import com.investwise.goal.dto.GoalResponse;
import com.investwise.goal.entity.GoalStatus;
import com.investwise.goal.entity.InvestmentGoal;
import com.investwise.goal.entity.RiskProfile;
import com.investwise.goal.repository.GoalRepository;
import com.investwise.user.entity.User;
import com.investwise.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserService userService;
    private final AccountService accountService;

    @Transactional
    public GoalResponse createGoal(Long userId, GoalRequest request) {
        User user = userService.getUserById(userId);

        BigDecimal initialContribution = (request.getInitialContribution() != null && request.getInitialContribution().compareTo(BigDecimal.ZERO) > 0) ?
                request.getInitialContribution() : BigDecimal.ZERO;

        if (initialContribution.compareTo(BigDecimal.ZERO) > 0) {
            accountService.debitAvailableCash(userId, initialContribution);
        }

        InvestmentGoal goal = InvestmentGoal.builder()
                .user(user)
                .title(request.getTitle().trim())
                .targetAmount(request.getTargetAmount())
                .currentAmount(initialContribution)
                .targetDate(request.getTargetDate())
                .riskProfile(request.getRiskProfile() != null ? request.getRiskProfile() : RiskProfile.MODERATE)
                .status(initialContribution.compareTo(request.getTargetAmount()) >= 0 ? GoalStatus.ACHIEVED : GoalStatus.ACTIVE)
                .build();

        InvestmentGoal saved = goalRepository.save(goal);
        return mapToGoalResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<GoalResponse> getUserGoals(Long userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToGoalResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GoalResponse contributeToGoal(Long userId, Long goalId, BigDecimal amount) {
        InvestmentGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not own this goal");
        }

        accountService.debitAvailableCash(userId, amount);

        BigDecimal newCurrent = goal.getCurrentAmount().add(amount);
        goal.setCurrentAmount(newCurrent);
        if (newCurrent.compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(GoalStatus.ACHIEVED);
        }

        InvestmentGoal updated = goalRepository.save(goal);
        return mapToGoalResponse(updated);
    }

    @Transactional
    public GoalResponse cancelGoal(Long userId, Long goalId) {
        InvestmentGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not own this goal");
        }

        if (goal.getCurrentAmount().compareTo(BigDecimal.ZERO) > 0) {
            accountService.creditCash(userId, goal.getCurrentAmount());
            goal.setCurrentAmount(BigDecimal.ZERO);
        }

        goal.setStatus(GoalStatus.CANCELLED);
        InvestmentGoal saved = goalRepository.save(goal);
        return mapToGoalResponse(saved);
    }

    private GoalResponse mapToGoalResponse(InvestmentGoal goal) {
        BigDecimal progress = (goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) ?
                goal.getCurrentAmount().divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        return GoalResponse.builder()
                .id(goal.getId())
                .userId(goal.getUser().getId())
                .title(goal.getTitle())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .progressPercentage(progress.min(BigDecimal.valueOf(100)))
                .targetDate(goal.getTargetDate())
                .riskProfile(goal.getRiskProfile())
                .status(goal.getStatus())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}

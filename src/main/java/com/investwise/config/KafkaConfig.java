package com.investwise.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
@ConditionalOnProperty(name = "investwise.kafka.enabled", havingValue = "true", matchIfMissing = false)
public class KafkaConfig {

    @Bean
    public NewTopic orderEventsTopic() {
        return TopicBuilder.name("investwise.order.events")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic priceAlertEventsTopic() {
        return TopicBuilder.name("investwise.alert.events")
                .partitions(3)
                .replicas(1)
                .build();
    }
}

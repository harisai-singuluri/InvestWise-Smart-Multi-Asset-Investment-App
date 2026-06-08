package com.investwise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InvestWiseApplication {

    public static void main(String[] args) {
        SpringApplication.run(InvestWiseApplication.class, args);
    }
}

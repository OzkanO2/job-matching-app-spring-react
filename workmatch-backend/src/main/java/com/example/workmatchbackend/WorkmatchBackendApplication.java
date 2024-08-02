package com.example.workmatchbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class })
public class WorkmatchBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(WorkmatchBackendApplication.class, args);

	}
}

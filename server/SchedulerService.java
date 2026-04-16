package com.oddoneout.server.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.*;

@Service
public class SchedulerService {

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);

    public void schedule(Runnable task, int delayMs) {
        scheduler.schedule(task, delayMs, TimeUnit.MILLISECONDS);
    }
}
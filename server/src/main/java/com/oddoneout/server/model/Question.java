package com.oddoneout.server.model;

public class Question {
    private String topic;
    private String normal;
    private String impostor;

    public Question(String topic, String normal, String impostor) {
        this.topic = topic;
        this.normal = normal;
        this.impostor = impostor;
    }

    public String getNormal() { return normal; }
    public String getImpostor() { return impostor; }
}
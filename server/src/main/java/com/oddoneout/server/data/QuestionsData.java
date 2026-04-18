package com.oddoneout.server.data;

import com.oddoneout.server.model.Question;
import java.util.*;

public class QuestionsData {

    public static List<Question> questions = List.of(

        new Question("Friends","Who is the funniest friend?","Who laughs the loudest?"),
        new Question("Party","Who dances the best at parties?","Who stays the longest at parties?"),
        new Question("Dating","Who would fall in love the fastest?","Who flirts the most on dates?"),
        new Question("Food","Who eats the most food?","Who orders the weirdest food?"),
        new Question("Travel","Who plans trips the best?","Who gets lost during trips?"),
        new Question("School","Who studies the hardest?","Who sleeps the most in class?"),
        new Question("LateNight","Who stays awake the latest?","Who wakes up the earliest?"),
        new Question("Movies","Who cries during emotional movies?","Who laughs during serious scenes?"),
        new Question("Gaming","Who rages the most while gaming?","Who celebrates the loudest when winning?"),
        new Question("Phone","Who checks their phone the most?","Who replies the slowest to messages?"),

        new Question("Gym","Who goes to the gym most consistently?","Who quits the gym first?"),
        new Question("Music","Who sings the best?","Who sings the loudest?"),
        new Question("Driving","Who drives the fastest?","Who gets lost while driving?"),
        new Question("SocialMedia","Who posts the most selfies?","Who scrolls social media the longest?"),
        new Question("Sleep","Who sleeps the longest?","Who snores the loudest?"),
        new Question("Cooking","Who cooks the best meals?","Who burns food the most?"),
        new Question("Drama","Who starts the most drama?","Who enjoys watching drama the most?"),
        new Question("Confidence","Who is the most confident?","Who pretends to be confident?"),
        new Question("Fashion","Who dresses the best?","Who takes longest to choose clothes?"),
        new Question("Secrets","Who keeps secrets the best?","Who accidentally reveals secrets?"),

        new Question("Adventure","Who would try crazy adventures first?","Who regrets crazy adventures first?"),
        new Question("Laughing","Who laughs at everything?","Who laughs at their own jokes?"),
        new Question("Pets","Who loves animals the most?","Who is scared of animals the most?"),
        new Question("Sports","Who is the most athletic?","Who pretends to like sports?"),
        new Question("Books","Who reads the most books?","Who buys books but never reads them?"),
        new Question("Rain","Who enjoys rain the most?","Who complains about rain the most?"),
        new Question("Coffee","Who drinks the most coffee?","Who stays awake without coffee?"),
        new Question("RoadTrip","Who controls the music on road trips?","Who falls asleep first on road trips?"),
        new Question("Work","Who works the hardest?","Who procrastinates the most?"),
        new Question("Shopping","Who buys the most clothes?","Who spends the longest shopping?"),

        new Question("FriendGroup","Who organizes group plans?","Who cancels plans the most?"),
        new Question("Memes","Who sends the best memes?","Who sends the most memes?"),
        new Question("Jokes","Who tells the funniest jokes?","Who laughs before finishing a joke?"),
        new Question("Chill","Who is the most relaxed person?","Who pretends to be relaxed?"),
        new Question("Advice","Who gives the best advice?","Who ignores their own advice?"),
        new Question("Planning","Who plans everything?","Who goes with the flow always?"),
        new Question("MusicTaste","Who has the best music taste?","Who listens to music the loudest?"),
        new Question("Weather","Who complains about heat the most?","Who complains about cold the most?"),
        new Question("Laugh","Who has the most contagious laugh?","Who laughs the weirdest?"),
        new Question("Energy","Who has the most energy in the group?","Who gets tired the fastest?"),

        new Question("Dating","Who would text their crush first?","Who waits longest to reply to a crush?"),
        new Question("Romance","Who plans the best romantic date?","Who forgets anniversaries?"),
        new Question("FirstDate","Who gets nervous on first dates?","Who talks nonstop on first dates?"),
        new Question("Flirting","Who is the best at flirting?","Who flirts without realizing it?"),
        new Question("Love","Who falls in love quickly?","Who pretends not to care about love?"),
        new Question("Compliments","Who gives the best compliments?","Who receives the most compliments?"),
        new Question("DatingApps","Who would use dating apps the most?","Who deletes dating apps the fastest?"),
        new Question("RomanticMovies","Who enjoys romantic movies?","Who makes fun of romantic movies?"),
        new Question("Jealousy","Who gets jealous the fastest?","Who pretends not to be jealous?"),
        new Question("Crush","Who has the most secret crushes?","Who denies having crushes?"),

        new Question("Awkward","Who gets awkward in silence?","Who talks to break awkward silence?"),
        new Question("Texting","Who texts the most?","Who leaves messages on read?"),
        new Question("NightOut","Who suggests going out?","Who cancels last minute?"),
        new Question("LaughingFit","Who laughs during serious moments?","Who stays serious during jokes?"),
        new Question("Pranks","Who pulls the best pranks?","Who falls for pranks the most?"),
        new Question("Dance","Who dances confidently?","Who dances awkwardly?"),
        new Question("FoodShare","Who shares food the most?","Who steals food from others?"),
        new Question("CookingSkill","Who experiments in cooking?","Who orders takeout instead?"),
        new Question("TravelPhotos","Who takes the best travel photos?","Who takes the most selfies?"),
        new Question("Beach","Who loves the beach the most?","Who hates sand the most?"),

        new Question("Cold","Who always feels cold?","Who always feels hot?"),
        new Question("EarlyBird","Who wakes up early easily?","Who stays awake till morning?"),
        new Question("FoodChoice","Who tries new food?","Who sticks to the same food?"),
        new Question("AdventureTrip","Who suggests crazy trips?","Who backs out of trips?"),
        new Question("WorkStress","Who stresses about work the most?","Who ignores work stress the most?"),
        new Question("Laughing","Who laughs the loudest?","Who laughs silently?"),
        new Question("FashionRisk","Who experiments with fashion?","Who plays safe with fashion?"),
        new Question("Music","Who listens to music all day?","Who sings randomly?"),
        new Question("TravelDream","Who dreams of traveling the world?","Who prefers staying home?"),
        new Question("GameNight","Who is most competitive in games?","Who jokes around in games?"),

        new Question("Friends","Who gives the best hugs?","Who avoids hugs?"),
        new Question("Energy","Who brings the most energy to the group?","Who calms everyone down?"),
        new Question("Storytelling","Who tells the best stories?","Who exaggerates stories?"),
        new Question("Sarcasm","Who is the most sarcastic?","Who doesn't understand sarcasm?"),
        new Question("LaughTrack","Who laughs at bad jokes?","Who criticizes bad jokes?"),
        new Question("Sleepovers","Who talks the most during sleepovers?","Who sleeps first?"),
        new Question("Photos","Who takes group photos?","Who avoids photos?"),
        new Question("PlanningTrips","Who plans trips carefully?","Who improvises trips?"),
        new Question("Confidence","Who walks into rooms confidently?","Who observes quietly?"),
        new Question("FunnyMoments","Who causes the funniest moments?","Who laughs at funny moments?"),

        new Question("Dates","Who would plan a fancy date?","Who would plan a chill casual date?"),
        new Question("Charm","Who charms strangers easily?","Who avoids talking to strangers?"),
        new Question("Romantic","Who believes in romantic gestures?","Who thinks romance is overrated?"),
        new Question("Blushing","Who blushes the fastest?","Who hides embarrassment the best?"),
        new Question("Compliments","Who gives sweet compliments?","Who jokes while complimenting?"),
        new Question("Couples","Who gives the best couple advice?","Who teases couples the most?"),
        new Question("FriendSupport","Who supports friends the most?","Who roasts friends the most?"),
        new Question("LaughAttack","Who starts laughing first?","Who can't stop laughing once started?"),
        new Question("Food","Who finishes their food fastest?","Who shares their food most?"),
        new Question("Plans","Who makes the most spontaneous plans?","Who prefers planning ahead?")
    );

    public static Question randomQuestion() {
        Random r = new Random();
        return questions.get(r.nextInt(questions.size()));
    }
}
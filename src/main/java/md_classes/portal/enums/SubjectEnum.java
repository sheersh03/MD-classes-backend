package md_classes.portal.enums;

import java.util.List;
import java.util.Set;

public enum SubjectEnum {
    MATHS("Maths", Set.of("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "class 1", "class 2", "class 3", "class 4", "class 5", "class 6", "class 7", "class 8", "class 9", "class 10")),
    ENGLISH("English", Set.of("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "class 1", "class 2", "class 3", "class 4", "class 5", "class 6", "class 7", "class 8", "class 9", "class 10")),
    HINDI("Hindi", Set.of("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "class 1", "class 2", "class 3", "class 4", "class 5", "class 6", "class 7", "class 8", "class 9", "class 10")),
    COMPUTER("Computer", Set.of("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "class 1", "class 2", "class 3", "class 4", "class 5", "class 6", "class 7", "class 8", "class 9", "class 10")),
    EVS("Environmental Studies (EVS)", Set.of("1", "2", "3", "4", "5", "class 1", "class 2", "class 3", "class 4", "class 5")),
    SCIENCE("Science", Set.of("6", "7", "8", "9", "10", "class 6", "class 7", "class 8", "class 9", "class 10")),
    SOCIAL_SCIENCE("Social Science", Set.of("6", "7", "8", "9", "10", "class 6", "class 7", "class 8", "class 9", "class 10")),
    SANSKRIT("Sanskrit", Set.of("6", "7", "8", "class 6", "class 7", "class 8")),
    GK("General Knowledge", Set.of("1", "2", "3", "4", "5", "6", "7", "8", "class 1", "class 2", "class 3", "class 4", "class 5", "class 6", "class 7", "class 8"));

    private final String displayName;
    private final Set<String> applicableClasses;

    SubjectEnum(String displayName, Set<String> applicableClasses) {
        this.displayName = displayName;
        this.applicableClasses = applicableClasses;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static List<String> getSubjectsForClass(String className) {
        if (className == null) return List.of();
        String normalized = className.trim().toLowerCase();

        return java.util.Arrays.stream(SubjectEnum.values())
                .filter(subject -> subject.applicableClasses.stream()
                        .anyMatch(c -> c.toLowerCase().equals(normalized)))
                .map(SubjectEnum::getDisplayName)
                .toList();
    }
}

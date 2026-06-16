package md_classes.portal.dto.auth;

import md_classes.portal.domain.User;
import md_classes.portal.enums.Role;

public record UserSummary(Long id, String name, String email, Role role) {
    public static UserSummary from(User u) {
        return new UserSummary(u.getId(), u.getName(), u.getEmail(), u.getRole());
    }
}

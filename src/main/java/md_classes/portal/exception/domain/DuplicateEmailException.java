package md_classes.portal.exception.domain;

public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String email) {
        super("email already registered: " + email);
    }
}

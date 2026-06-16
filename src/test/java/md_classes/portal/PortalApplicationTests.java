package md_classes.portal;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.DockerClientFactory;

@SpringBootTest
@ActiveProfiles("test")
@EnabledIf("md_classes.portal.PortalApplicationTests#dockerAvailable")
class PortalApplicationTests {

	static boolean dockerAvailable() {
		try {
			return DockerClientFactory.instance().isDockerAvailable();
		} catch (Throwable t) {
			return false;
		}
	}

	@BeforeAll
	static void announce() {
		System.out.println("[PortalApplicationTests] Docker available — running Spring context test");
	}

	@Test
	void contextLoads() {
	}

}

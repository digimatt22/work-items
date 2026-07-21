import { describe, expect, it } from "vitest";
import { deliveryFailureUrl } from "./redirect";

describe("delivery failure redirect", () => {
  it("uses the canonical public origin instead of the container origin", () => {
    expect(
      deliveryFailureUrl(
        "public-token",
        "https://portal.digicolony.net",
      ).toString(),
    ).toBe("https://portal.digicolony.net/deliveries/public-token?error=1");
  });
});

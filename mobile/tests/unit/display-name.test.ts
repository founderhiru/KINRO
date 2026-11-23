import { describe, expect, it } from "vitest";
import { firstNameOf, realName } from "@/lib/display-name";

describe("display name", () => {
  it("rejects phone numbers and blanks", () => {
    expect(realName("+919854898548")).toBeNull();
    expect(realName("+91 98548 98548")).toBeNull();
    expect(realName("  ")).toBeNull();
    expect(realName(null)).toBeNull();
  });
  it("keeps real names and takes the first word", () => {
    expect(realName("Hiranya Rao")).toBe("Hiranya Rao");
    expect(firstNameOf("Hiranya Rao")).toBe("Hiranya");
    expect(firstNameOf("+919854898548")).toBeNull();
  });
});

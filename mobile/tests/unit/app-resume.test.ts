import type { AppStateStatus } from "react-native";
import { describe, expect, it } from "vitest";
import { nextResumeState } from "@/lib/app-resume";

/** Feeds a sequence of AppState events through and returns which ones showed the splash. */
function run(events: AppStateStatus[]): boolean[] {
  let wasBackgrounded = false;
  return events.map((event) => {
    const result = nextResumeState(wasBackgrounded, event);
    wasBackgrounded = result.wasBackgrounded;
    return result.showSplash;
  });
}

describe("nextResumeState", () => {
  it("shows the splash when iOS returns from background (via inactive)", () => {
    expect(run(["inactive", "background", "inactive", "active"])).toEqual([
      false,
      false,
      false,
      true,
    ]);
  });

  it("shows the splash when Android returns from background", () => {
    expect(run(["background", "active"])).toEqual([false, true]);
  });

  it("does not show it for an inactive-only round trip (Control Center, prompts)", () => {
    expect(run(["inactive", "active"])).toEqual([false, false]);
  });

  it("does not show it on launch or when already active", () => {
    expect(run(["active", "active"])).toEqual([false, false]);
  });

  it("shows it once per trip to the background, not on repeated active events", () => {
    expect(
      run(["background", "active", "active", "background", "active"]),
    ).toEqual([false, true, false, false, true]);
  });
});

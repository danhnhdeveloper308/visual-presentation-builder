/**
 * Test hệ hiệu ứng (chạy: pnpm --filter web exec jiti scripts/test-animations.ts):
 * 44 effect — schema/metadata khớp nhau, keyframes hợp lệ (giữ rotation), fill đúng nhóm,
 * và cấu trúc chuỗi (chain) của player trình chiếu.
 */
import { animationEffectSchema, animationSchema, type Animation } from "@repo/shared";
import {
  ANIMATION_EFFECTS,
  EFFECT_META,
  buildAnimation,
  createAnimation,
} from "../src/lib/editor/animations";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
  } catch (e) {
    failed++;
    console.error(`✗ ${name}:`, e instanceof Error ? e.message : e);
  }
}

function assert(cond: boolean, msg = "assert failed") {
  if (!cond) throw new Error(msg);
}

const ENUM_VALUES = animationEffectSchema.options;

test("đủ 44 hiệu ứng trong enum", () => assert(ENUM_VALUES.length === 44, `enum=${ENUM_VALUES.length}`));

test("metadata phủ đúng enum, không thừa không thiếu", () => {
  const metaIds = new Set(ANIMATION_EFFECTS.map((e) => e.id));
  for (const v of ENUM_VALUES) assert(metaIds.has(v), `thiếu meta: ${v}`);
  assert(metaIds.size === ENUM_VALUES.length, "meta thừa id ngoài enum");
});

for (const effect of ENUM_VALUES) {
  test(`effect ${effect}: createAnimation parse schema + keyframes hợp lệ (rotation 0 và 30)`, () => {
    const anim = createAnimation("el1", effect);
    animationSchema.parse(anim);
    assert(anim.group === EFFECT_META[effect].group, "group khớp meta");
    for (const rot of [0, 30]) {
      const { keyframes, options } = buildAnimation(anim, rot);
      assert(keyframes.length >= 2, `keyframes >= 2 (${keyframes.length})`);
      assert(options.duration === anim.durationMs, "duration");
      // hiệu ứng transform phải giữ rotation của element
      if (rot === 30) {
        const usesTransform = keyframes.some((k) => typeof k.transform === "string");
        if (usesTransform) {
          const keepsRot = keyframes.some(
            (k) => typeof k.transform === "string" && k.transform.includes("rotate("),
          );
          assert(keepsRot, "transform giữ rotate() khi rotation=30");
        }
      }
      // offset (nếu khai) phải tăng dần trong [0,1]
      let last = -1;
      for (const k of keyframes) {
        if (typeof k.offset === "number") {
          assert(k.offset >= last && k.offset >= 0 && k.offset <= 1, `offset tăng dần (${k.offset})`);
          last = k.offset;
        }
      }
    }
  });
}

test("fill: entrance/exit + emphasis-giữ = forwards; emphasis thường = none", () => {
  const fillOf = (effect: Parameters<typeof createAnimation>[1]) =>
    buildAnimation(createAnimation("e", effect), 0).options.fill;
  assert(fillOf("fade-in") === "forwards", "entrance");
  assert(fillOf("fly-out") === "forwards", "exit");
  assert(fillOf("pulse") === "none", "emphasis thường");
  assert(fillOf("teeter") === "none", "teeter");
  for (const e of ["desaturate", "darken", "lighten", "transparency"] as const) {
    assert(fillOf(e) === "forwards", `${e} giữ trạng thái`);
  }
});

test("motion-circle khép kín về (0,0); motion-arc kết thúc đúng khoảng cách", () => {
  const circle = buildAnimation(createAnimation("e", "motion-circle"), 0).keyframes;
  const first = String(circle[0]!.transform);
  const last = String(circle[circle.length - 1]!.transform);
  assert(first.includes("translate(0px, 0px)") && last.includes("translate(0px, 0px)"), `${first} … ${last}`);

  const arc = { ...createAnimation("e", "motion-arc"), direction: "right" as const };
  const arcKf = buildAnimation(arc, 0).keyframes;
  const end = String(arcKf[arcKf.length - 1]!.transform);
  assert(end.includes("translate(240px, 0px)"), end);
});

test("autoReverse nhân đôi iterations + alternate", () => {
  const anim: Animation = { ...createAnimation("e", "pulse"), repeat: 3, autoReverse: true };
  const { options } = buildAnimation(anim, 0);
  assert(options.iterations === 6 && options.direction === "alternate");
});

/* ---- cấu trúc chuỗi (chain) — mô phỏng logic gom bước của player ---- */
function chainStarts(triggers: Animation["trigger"][]): number[] {
  // gom with-previous vào bước trước → steps; chain bắt đầu ở step 0 và mọi step on-click
  const steps: Animation["trigger"][][] = [];
  for (const t of triggers) {
    if (t === "with-previous" && steps.length > 0) steps[steps.length - 1]!.push(t);
    else steps.push([t]);
  }
  const starts: number[] = [];
  steps.forEach((s, i) => {
    if (i === 0 || s[0] === "on-click") starts.push(i);
  });
  return starts;
}

test("chain: on-click × n → n chuỗi riêng (mỗi click gỡ được 1 bước)", () => {
  assert(JSON.stringify(chainStarts(["on-click", "on-click", "on-click"])) === "[0,1,2]");
});

test("chain: after/with-previous dính vào chuỗi của on-click đứng trước", () => {
  assert(
    JSON.stringify(chainStarts(["on-click", "after-previous", "with-previous", "on-click"])) === "[0,2]",
  );
});

console.log(`\n${passed}/${passed + failed} pass${failed ? ` — ${failed} FAIL` : ""}`);
if (failed > 0) process.exit(1);

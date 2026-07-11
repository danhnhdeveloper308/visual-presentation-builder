/**
 * Test căn hàng / phân bố đều / clone-paste (chạy: pnpm --filter web exec jiti scripts/test-arrange.ts).
 */
import type { SlideElement } from "@repo/shared";
import {
  alignBoxes,
  cloneElementsForPaste,
  distributeBoxes,
  elementBox,
  unionBounds,
  SLIDE_BOUNDS,
} from "../src/lib/editor/arrange";

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

function eq<T>(actual: T, expected: T, msg?: string) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${msg ?? "eq"}: ${a} !== ${b}`);
}

function assert(cond: boolean, msg = "assert failed") {
  if (!cond) throw new Error(msg);
}

const box = (id: string, x: number, y: number, w = 100, h = 50) => ({ id, x, y, w, h });

test("unionBounds bao đúng nhiều box", () => {
  eq(unionBounds([box("a", 10, 20), box("b", 200, 100, 50, 200)]), { x: 10, y: 20, w: 240, h: 280 });
});

test("align left/right/center-x theo khung bao", () => {
  const boxes = [box("a", 10, 0), box("b", 200, 60, 50, 50)];
  const bounds = unionBounds(boxes); // x 10..250
  eq(alignBoxes(boxes, "left", bounds).get("b"), { x: 10, y: 60 });
  eq(alignBoxes(boxes, "right", bounds).get("a"), { x: 150, y: 0 });
  const cx = alignBoxes(boxes, "center-x", bounds);
  eq(cx.get("a"), { x: 80, y: 0 }); // 10 + (240-100)/2
  eq(cx.get("b"), { x: 105, y: 60 }); // 10 + (240-50)/2
});

test("align top/bottom/center-y theo khung bao", () => {
  const boxes = [box("a", 0, 10), box("b", 0, 300, 100, 100)];
  const bounds = unionBounds(boxes); // y 10..400
  eq(alignBoxes(boxes, "top", bounds).get("b"), { x: 0, y: 10 });
  eq(alignBoxes(boxes, "bottom", bounds).get("a"), { x: 0, y: 350 });
  eq(alignBoxes(boxes, "center-y", bounds).get("a"), { x: 0, y: 180 }); // 10 + (390-50)/2
});

test("box đã đúng vị trí thì KHÔNG có trong kết quả (không dirty thừa)", () => {
  const boxes = [box("a", 0, 0), box("b", 0, 100)];
  const moves = alignBoxes(boxes, "left", unionBounds(boxes));
  eq(moves.size, 0);
});

test("căn 1 element theo slide 1280×720", () => {
  const b = [box("a", 5, 5, 200, 100)];
  eq(alignBoxes(b, "center-x", SLIDE_BOUNDS).get("a"), { x: 540, y: 5 });
  eq(alignBoxes(b, "bottom", SLIDE_BOUNDS).get("a"), { x: 5, y: 620 });
});

test("distribute x: giữ 2 đầu, chia đều khoảng hở", () => {
  // a[0..100] c[400..500] b ở giữa lệch — span 500, tổng size 300 → gap 100
  const boxes = [box("a", 0, 0), box("b", 150, 0), box("c", 400, 0)];
  const moves = distributeBoxes(boxes, "x");
  eq(moves.get("b"), { x: 200, y: 0 });
  assert(!moves.has("a") && !moves.has("c"), "2 đầu giữ nguyên");
});

test("distribute y với kích thước khác nhau", () => {
  // a h50 [0..50], b h100, c h50 [350..400] → span 400, size 200, gap 100
  const boxes = [box("a", 0, 0, 100, 50), box("b", 0, 120, 100, 100), box("c", 0, 350, 100, 50)];
  const moves = distributeBoxes(boxes, "y");
  eq(moves.get("b"), { x: 0, y: 150 });
});

test("distribute < 3 element → rỗng", () => {
  eq(distributeBoxes([box("a", 0, 0), box("b", 10, 10)], "x").size, 0);
});

test("elementBox map đúng từ SlideElement", () => {
  const el = {
    id: "e1",
    type: "shape",
    position: { x: 7, y: 8 },
    size: { width: 30, height: 40 },
    rotation: 0,
    zIndex: 1,
    props: { shape: "rect", fill: "#fff" },
  } as SlideElement;
  eq(elementBox(el), { id: "e1", x: 7, y: 8, w: 30, h: 40 });
});

test("cloneElementsForPaste: id mới, lệch +24, zIndex nối tiếp, groupId remap nhất quán", () => {
  const src = [
    { id: "a", type: "shape", position: { x: 0, y: 0 }, size: { width: 10, height: 10 }, rotation: 0, zIndex: 1, groupId: "g1", props: { shape: "rect", fill: "#fff" } },
    { id: "b", type: "shape", position: { x: 20, y: 0 }, size: { width: 10, height: 10 }, rotation: 0, zIndex: 2, groupId: "g1", props: { shape: "rect", fill: "#fff" } },
  ] as SlideElement[];
  const target = [{ ...src[0]!, id: "t", zIndex: 7, groupId: undefined }];
  const clones = cloneElementsForPaste(src, target);
  assert(clones[0]!.id !== "a" && clones[1]!.id !== "b", "id mới");
  eq(clones[0]!.position, { x: 24, y: 24 });
  eq(clones.map((c) => c.zIndex), [8, 9], "zIndex nối tiếp trên slide đích");
  assert(clones[0]!.groupId === clones[1]!.groupId && clones[0]!.groupId !== "g1", "groupId remap chung");
});

console.log(`\n${passed}/${passed + failed} pass${failed ? ` — ${failed} FAIL` : ""}`);
if (failed > 0) process.exit(1);

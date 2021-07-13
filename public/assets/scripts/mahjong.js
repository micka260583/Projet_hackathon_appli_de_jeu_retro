// 下準備
const { min, max, floor, ceil, random } = Math;
const pick = a => a.splice(a.length * random(), 1)[0];
const range = (start, stop, step) => {
    if (stop === undefined) {
        stop = start;
        start = 0;
    }
    step = step || (stop < start ? -1 : 1);
    const length = max(0, ceil((stop - start) / step));
    return Array.from({ length }, (_, i) => start + step * i);
};

// コピーして上書き、CodePen だと Spread Properties を変換できないようなので
const overwrite = (a, b) => Object.assign({}, a, b);

// 盤面設定
const W = 32; // 横
const H = 17; // 縦
const D = 5; // 高さ
const N = W * H * D; // マスの数

// 座標とインデックスの相互変換
const X = p => p % W;
const Y = p => floor(p / W) % H;
const Z = p => floor(p / W / H);
const fromXYZ = (x, y, z) => (z * H + y) * W + x;


const group = v => floor(v / 4);


const create = stage => {
    const tileCount = stage.reduce((n, v) => n + (v ? 1 : 0), 0);

    // 無地上海を準備
    const temporal = stage.slice(0);
    const nextPositionPair = () => {
        // 自由牌の集合を見つける
        const freePositions = range(N).filter(p => isFree(temporal, p));

        // 自由牌の個数
        const count = freePositions.length;
        if (count < 2) {
            throw new Error("unreachable"); // ここに来てたらそもそも積み方がおかしい or バグ
        }

        const p1 = freePositions[count - 1]; // 一番高いもの
        const p2 = freePositions[count - 2]; // 二番目に高いもの
        const diff = Z(p1) - Z(p2); // 高低差

        let p;
        if (diff + 2 >= count) { // 詰みルート突入の可能性アリ
            p = freePositions.pop(); // 最も高いものを取る (高低差を埋める)
        } else {
            p = pick(freePositions); // ランダムに取る
        }
        const q = pick(freePositions); // ランダムに取る
        temporal[p] = temporal[q] = 0;
        // 選んだ二つの組の位置を返す
        return [p, q];
    };

    // 同種ペアの配列を作る。牌IDは4以上の整数。
    const tilePairs = range(tileCount / 2).map(i => [4 + 2 * i, 4 + 2 * i + 1]);

    // 盤面を作る
    const board = []; // 初期値はすべて 0 (さぼって undefined のまま)
    range(tileCount / 2).forEach(_ => {
        const [p1, p2] = nextPositionPair(); // 無地上海を一手解いて位置を取得
        const [v1, v2] = pick(tilePairs); // 柄当てはめ
        board[p1] = v1; // 実際の上海の盤面に追加
        board[p2] = v2; // 実際の上海の盤面に追加
    });

    return {
        board, // 盤面
        target: -1, // 選択牌座標(未選択は-1)
        rest: tileCount // 残りの牌の数
    };
};

// 状態の更新, state: 前の状態, p: 選択インデックス
const update = (state, p) => {
    const { board, target, rest } = state;

    // 自由牌でないなら未選択に
    if (!isFree(board, p)) {
        return { board, rest, target: -1 };
    }

    // 選択済みの牌が無いなら選択状態に
    if (target < 0) {
        return { board, rest, target: p };
    }

    // 条件を満たしていなければ未選択に
    if (p === target || group(board[p]) !== group(board[target])) {
        return { board, rest, target: -1 };
    }

    // ペアを取り除いて未選択に
    return {
        board: board.map((v, i) => (i === p || i === target) ? 0 : v),
        target: -1,
        rest: rest - 2
    };
};

// 自由牌か否かを判定する
const isFree = (board, p) => {
    // そもそも牌が無いなら false
    if (!board[p]) {
        return false;
    }
    const x = X(p);
    const y = Y(p);
    const z = Z(p);

    return (
            // 左右どちらかが空いている
            range(-1, 2).every(dy => !board[fromXYZ(x - 2, y + dy, z)]) ||
            range(-1, 2).every(dy => !board[fromXYZ(x + 2, y + dy, z)])
        ) &&
        // 牌の上に何も重なっていない
        range(-1, 2).every(
            dy => range(-1, 2).every(
                dx => !board[fromXYZ(x + dx, y + dy, z + 1)]));
};

// とれる牌の組を探す
const findPair = board => {
    const pairs = {};
    for (const [p, t] of board.entries()) {
        if (!isFree(board, p)) continue;
        const v = group(t);
        if (pairs[v]) {
            return [p, pairs[v]];
        } else {
            pairs[v] = p;
        }
    }
};

// 牌の文字
const tileChar = t => {
    const v = group(t);
    return v < 1 ? '' :
        v < 8 ? '東南西北中發　' [v - 1] :
        v < 17 ? '一二三四五六七八九' [v - 8] :
        v < 26 ? String.fromCharCode(0x2160 + v - 17) :
        v < 35 ? String.fromCharCode(0x0031 + v - 26) :
        v == 35 ? '春夏秋冬' [t % 4] : '梅蘭菊竹' [t % 4];
};

// 牌の文字色
const tileColor = t => {
    const v = group(t);
    return v < 1 ? 'black' :
        v < 5 ? '#333' :
        v < 8 ? ['red', 'green', 'black'][v - 5] :
        v < 17 ? 'red' :
        v < 26 ? 'green' :
        v < 35 ? 'navy' :
        v === 35 ? 'sienna' : 'purple';
};

const main = () => {
    // control

    // 状態はスタックで持つ (適当に作ったのでやや非効率)
    const stack = [];
    const getState = () => stack[stack.length - 1];
    const setState = state => {
        while (stack.length && getState().rest <= state.rest) {
            stack.pop();
        }
        stack.push(state);
        render(state);
    };

    // 各種操作
    const stage = TURTLE; // 牌の積み方、定義は下の方に
    const init = () => {
        stack.length = 0;
        setState(create(stage));
    };
    const undo = () => {
        if (stack.length > 1) {
            setState(overwrite(stack[stack.length - 2], { target: -1 }));
        }
    };
    const reset = () => {
        if (stack.length > 0) {
            setState(overwrite(stack[0], { target: -1 }));
        }
    };
    const select = p => {
        setState(update(getState(), p));
    };

    // view
    document.head.insertAdjacentHTML('beforeend', `<style>${STYLE}</style>`);

    const message = document.createElement('p');

    const div = () => document.createElement('div');

    const view = div();
    view.classList.add('view');
    const cells = range(D).flatMap(z => {
        const table = div();
        view.append(table);
        return range(H).flatMap(y => {
            const row = div();
            table.append(row);
            return range(W).map(x => {
                const cell = div();
                cell.style.zIndex = x;
                row.append(cell);
                const p = fromXYZ(x, y, z);
                if (stage[p]) {
                    const tile = div();
                    tile.classList.add('tile');
                    cell.append(tile);
                    tile.onclick = e => select(p);
                }
                return cell;
            });
        });
    });

    const actions = [
        ['Undo', undo],
        ['Reset', reset],
        ['New', init]
    ];
    const buttons = document.createElement('p');
    for (let [name, action] of actions) {
        const button = document.createElement('button');
        button.type = 'button';
        button.innerHTML = name;
        button.onclick = e => {
            button.blur();
            action(e);
        };
        buttons.append(button);
    }

    document.getElementById('canvas').append(message, view, buttons);

    const render = ({ board, target, rest }) => {
        range(N).forEach(p => {
            const value = board[p];
            const cell = cells[p];
            const tile = cell.firstChild;
            if (!tile) return;
            tile.style.color = tileColor(value);
            tile.innerHTML = tileChar(value);
            const list = tile.classList;
            list.remove('selected', 'none');
            if (value === 0) {
                list.add('none');
            } else if (target === p) {
                list.add('selected');
            }
        });
        if (!rest) {
            message.innerHTML = 'clear!';
        } else if (!findPair(board)) {
            message.innerHTML = 'game over!';
        } else {
            message.innerHTML = rest / 2 + ' pairs left.';
        }
    };

    init();
};

const STYLE = `
.tile {
  /* font-family: serif; */
  font-family: "游明朝","Yu Mincho",YuMincho,"Hiragino Mincho ProN","Hiragino Mincho Pro","HGS明朝E",メイリオ,Meiryo,serif;
  font-weight: bold;
  box-sizing: border-box;
  width: 1.5em;
  height: 2em;
  line-height: 2em;
  text-align: center;
  background: #f8f8f8;
  border-radius: 0.125em;
  border: 1px solid #999;
  position: relative;
  box-shadow: 0.1em 0.1em 0px 0px #999, 0.2em 0.2em 0px 0px #963;
  cursor: pointer;
  user-select: none;
  pointer-events: auto;
  color: #333;
  padding-left: 2px;
  text-shadow: -1px 0px 0px #000, 1px 1px 0px #fff;
  transition: border-color 0.05s linear, box-shadow 0.05s linear;
  transition: visibility 0.1s linear, opacity 0.1s linear;
}
.tile.selected {
  border-color: red;
  box-shadow: 0px 0px 2px 2px #f33,
    0.1em 0.1em 0px 0px #999,
    0.2em 0.2em 0px 0px #963;
}
.tile:after,.tile:before {
  position:absolute;
  content: '';
  width: 0.2em;
  height: 0.2em;
  background: #963;
  z-index: -1;
  transition: visibility 0.1s step-end, opacity 0.1s step-end;
}
.tile:after {
  top:-1px;right:0;
  transform-origin: top right;
  transform: scale(1.4) rotate(-45deg);
}
.tile:before {
  bottom:0;left:-1px;
  transform-origin: bottom left;
  transform: scale(1.4) rotate(45deg);
}
.view {
  font-size: 125%;
  position: relative;
  pointer-events: none;
  margin: 0 auto;
  padding-bottom: 2em;
  width: 24em;
}
.view > div {
  display: block;
}
.view > div:not(:first-child) { position:absolute;top:0;left:0; }
.view > div:nth-child(4) { transform: translate(0.25em, 0.25em); }
.view > div:nth-child(3) { transform: translate(0.5em, 0.5em); }
.view > div:nth-child(2) { transform: translate(0.75em, 0.75em); }
.view > div:nth-child(1) { transform: translate(1em, 1em); }
.view > div > div {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 1em;
}
.view > div > div > div {
  flex-shrink: 0;
  display: inline-block;
  width: 0.75em;
  height: 1em;
  overflow: visible;
}
.tile.none {
  box-shadow: none;
  visibility: hidden;
  opacity: 0;
}
.tile.none:after,
.tile.none:before {
  visibility: hidden;
  opacity: 0;
  transition: visibility 0.1s step-start, opacity 0.1s step-start;
}
p {
  text-align: center;
  font: bold 1.5rem serif;
  margin: 0;
  color: black;
}
button {
  font: bold 1rem serif;
  color: white;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 0.25rem;
  cursor: pointer;
  user-select: none;
  transition: border-color 0.1s ease-in;
  margin: 0 1em;
  padding: 0.25em 0.5em;
}
button:hover, button:active {
  border-color: white;
}
`;

const TURTLE = [
    // layer 1
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0,
    0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // layer2
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // layer3
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // layer4
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // layer5
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

main();
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

console.log("JavaScript is loaded.");

window.addEventListener('load', function () {
    document.body.classList.remove('preload');
});

let resizeTimer;
window.addEventListener('resize', function () {
    document.body.classList.add('preload');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
        document.body.classList.remove('preload');
    }, 400); // 変更が終わって0.4秒後にアニメーションを解禁
});


const btn = document.getElementById('btn');
const nav = document.querySelector('.global-nav');
const navLinks = document.querySelectorAll('.global-nav a');


window.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading');

    // 3000ミリ秒（3秒）後に実行
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 3000);
});

window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading');
    const rotateContainer = document.getElementById('rotate-container')
    const mainContent = document.querySelector('.content');
    //カメラ
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 400);
    rotateContainer.appendChild(renderer.domElement);
    //ライト
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(5, 10, 7).normalize();
    scene.add(directionalLight);

    camera.position.z = 7;

    const loader = new GLTFLoader();
    let faceModel;
    loader.load(
        'img/myface.glb',
        (gltf) => {
            faceModel = gltf.scene;
            faceModel.scale.set(1.5, 1.5, 1.5);
            faceModel.rotation.y = THREE.MathUtils.degToRad(-45);
            scene.add(faceModel);
        },
        (xhr) => { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); },
        (error) => { console.error(error); }
    );
    function animate() {
        requestAnimationFrame(animate);

        if (faceModel) {

            faceModel.rotation.y += 0.01;
        }
        renderer.render(scene, camera);
    }

    animate();
    mainContent.classList.add('is-loaded');

    // レイアウト確定後にアスペクト比を再計算させるため、強制的にresizeイベントを発火
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 100);
});


// クリックされた時の処理を追加
btn.addEventListener('click', function () {
    if (this.classList.contains('active')) {
        // 開いている状態から閉じる時
        this.classList.remove('active');
        this.classList.add('close'); // 閉じる用のアニメーションクラスを付与
        nav.classList.remove('open');
    } else {
        // 閉じている状態から開く時
        this.classList.remove('close'); // 閉じる用クラスを外す
        this.classList.add('active');
        nav.classList.add('open');
    }
});
navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
        // メニューが開いている（openクラスがついている）場合のみ閉じる処理を実行
        if (nav.classList.contains('open')) {
            btn.classList.remove('active'); // バツ印の状態を解除
            btn.classList.add('close'); // バツから三本線に戻すアニメーションを実行
            nav.classList.remove('open'); // メニュー画面を非表示にする
        }
    });
});

const container = document.querySelector('.canvas-wrapper');
if (container) {
    const scene = new THREE.Scene();

    // Get initial size safely if container size isn't computed yet
    const initWidth = container.clientWidth || 300;
    const initHeight = container.clientHeight || 300;
    
    const camera = new THREE.PerspectiveCamera(75, initWidth / initHeight, 0.1, 1000);
    camera.position.z = 6.2;

    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#canvas'),
        antialias: true, // ギザギザを抑える
        alpha: true      // 背景を透明にできる
    });
    
    renderer.setSize(initWidth, initHeight, false); // 第3引数にfalseを渡し、Three.jsによる強制的なstyle指定を防ぐ
    renderer.setPixelRatio(window.devicePixelRatio);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    let model; // アニメーションループ内から参照できるように外部で宣言します
    let targetRotation = 0; // 目標とする最終的な角度
    let currentRotation = 0; // 現在の実際の角度
    let lastMouseX = null;

    // マウス移動イベント
    window.addEventListener('mousemove', (event) => {
        if (lastMouseX === null) {
            lastMouseX = event.clientX; // 開いて最初の１フレーム目は現在のマウス位置を基準にする
        }

        let mouseX = event.clientX;

        // 前のフレームからの移動距離を計算
        const deltaX = mouseX - lastMouseX;

        // マウスの移動量に応じて「目標の角度」を増減させる（0.005は回転の敏感さ）
        targetRotation += deltaX * 0.005;

        lastMouseX = mouseX;
    });

    const loader = new GLTFLoader();
    loader.load(
        'img/myface.glb',
        (gltf) => {
            model = gltf.scene; // ローカル変数から外部変数へ代入するように変更

            // 追加: モデルを少し上に持ち上げて下部にゆとりを作る（見切れ防止）
            model.position.y = 0.5; // 大きくした分、頭が見切れないよう少し下げてバランスをとる

            scene.add(model);
        },
        undefined,
        (error) => { console.error(error); }
    );

    function animate() {
        requestAnimationFrame(animate);

        if (model) {
            // 常に目標角度を増やし続け、自動で反時計回りに自転させる
            targetRotation += 0.005;

            // 現在の角度を目標の角度へ少しずつ近づける（イージング・線形補間）
            // 目標との差分の 3% (0.03) だけ進む。この数値を小さくするほど「重たい歯車」のようになります
            currentRotation += (targetRotation - currentRotation) * 0.03;

            // 実際のモデルのY軸に適用
            model.rotation.y = currentRotation;
        }

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        if (container && container.clientWidth > 0 && container.clientHeight > 0) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight, false); // ここもfalseを設定
        }
    });
}

const targets = document.querySelectorAll('.js-observer');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');

            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.2,
});

targets.forEach(target => {
    observer.observe(target);
});

const canvas = document.getElementById('glitch-cursor');
if (canvas) {
    const ctx = canvas.getContext('2d');

    let width, height;
    let mouse = { x: -100, y: -100 };
    let history = [];

    // --- パラメータ調整用 ---
    const trailLength = 8; // 残像の個数（多いと長い尾になる）
    const shapeSize = 18; // カーソル残像の大きさ
    const fadeRate = 0.08; // 1フレームごとに減る不透明度 (0.0 〜 1.0)
    const initialOpacity = 0.8; // 最新の残像の不透明度 (0.0 〜 1.0)
    const mainColor = '#00f0ff'; // 残像のメインカラー
    const shadowColor = '#ffffff'; // 発光色
    const glitchOffset = 5; // グリッチ時の最大ズレ幅
    // --------------------

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // --- カーソル形状（矢印）を描画する関数 ---
    function drawCursor(x, y, opacity, isGlitch, offsetX = 0, offsetY = 0) {
        ctx.save();
        ctx.translate(x + offsetX, y + offsetY);
        ctx.rotate(Math.PI / 180 * -25); // 矢印を少し左に傾ける

        ctx.globalAlpha = opacity;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // パスを定義（デフォルトの矢印っぽい形状）
        ctx.beginPath();
        ctx.moveTo(0, 0); // 先端
        ctx.lineTo(shapeSize * 0.45, shapeSize * 0.8); // 右下
        ctx.lineTo(shapeSize * 0.15, shapeSize * 0.75); // くびれ右
        ctx.lineTo(shapeSize * 0.15, shapeSize * 1.0); // 根本右
        ctx.lineTo(-shapeSize * 0.15, shapeSize * 1.0); // 根本左
        ctx.lineTo(-shapeSize * 0.15, shapeSize * 0.75); // くびれ左
        ctx.lineTo(-shapeSize * 0.45, shapeSize * 0.8); // 左下
        ctx.closePath();

        if (isGlitch) {
            // グリッチ時は塗りつぶして強烈に
            ctx.fillStyle = mainColor;
            ctx.fill();
            ctx.strokeStyle = shadowColor;
            ctx.stroke();
        } else {
            // 通常時は発光付きの輪郭
            ctx.shadowBlur = 10;
            ctx.shadowColor = mainColor;
            ctx.strokeStyle = shadowColor;
            ctx.stroke();
        }

        ctx.restore();
    }
    // ----------------------------------------

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // マウスが動いたら、新しい座標を履歴に追加
        if (mouse.x > -100) {
            history.unshift({ x: mouse.x, y: mouse.y, opacity: initialOpacity });
        }

        // 履歴が一定数を超えたら古いものを削除
        if (history.length > trailLength) {
            history.pop();
        }

        // 履歴をループして描画
        for (let i = 0; i < history.length; i++) {
            const p = history[i];
            p.opacity -= fadeRate; // フェードアウト

            if (p.opacity > 0) {
                const isGlitch = Math.random() < 0.1; // 10%の確率でグリッチ
                const offsetX = isGlitch ? (Math.random() - 0.5) * glitchOffset : 0;
                const offsetY = isGlitch ? (Math.random() - 0.5) * glitchOffset : 0;

                // 各軌跡にカーソルを描画
                drawCursor(p.x, p.y, p.opacity, isGlitch, offsetX, offsetY);
            } else {
                // 完全に消えた残像は配列から削除
                history.splice(i, 1);
                i--;
            }
        }

        requestAnimationFrame(draw);
    }

    draw();
}

// ====== Portfolio Detail PC Expansion ======
const workDetailBody = document.querySelector('.work-detail-body');
if (workDetailBody) {
    const detailRight = document.querySelector('.work-detail-right');
    const toggleBtn = document.querySelector('.work-detail-toggle');

    function toggleExpand() {
        if (window.innerWidth >= 769) { // PC版のみ動作
            workDetailBody.classList.toggle('is-expanded');
        }
    }

    if (detailRight) {
        detailRight.addEventListener('click', toggleExpand);
    }
    if (toggleBtn) {
        // ボタンのクリックイベント（バブリングを防ぐ）
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleExpand();
        });
    }
}

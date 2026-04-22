

        // --- Sistema de Sonido Moderno (Tarea 33) ---
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const SoundEngine = {
            play(type) {
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const now = audioCtx.currentTime;
                const masterGain = audioCtx.createGain();
                masterGain.connect(audioCtx.destination);

                switch (type) {
                    case 'shoot':
                        this.synthShoot(now, masterGain);
                        break;
                    case 'hit':
                        this.synthHit(now, masterGain);
                        break;
                    case 'death':
                        this.synthDeath(now, masterGain);
                        break;
                    case 'empty':
                        this.synthEmpty(now, masterGain);
                        break;
                    case 'recharge':
                        this.synthRecharge(now, masterGain);
                        break;
                    case 'ui':
                        this.synthUI(now, masterGain);
                        break;
                    case 'showdown':
                        this.synthShowdown(now, masterGain);
                        break;
                    case 'powerup':
                        this.synthPowerup(now, masterGain);
                        break;
                    case 'death_loss':
                        this.synthDeathLoss(now, masterGain);
                        break;
                }
            },

            synthShowdown(now, master) {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(400, now + 1.5);
                g.gain.setValueAtTime(0, now);
                g.gain.linearRampToValueAtTime(0.5, now + 0.2);
                g.gain.exponentialRampToValueAtTime(0.01, now + 2);
                osc.connect(g); g.connect(master);
                osc.start(now); osc.stop(now + 2);
            },

            synthPowerup(now, master) {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
                g.gain.setValueAtTime(0, now);
                g.gain.linearRampToValueAtTime(0.3, now + 0.05);
                g.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.connect(g); g.connect(master);
                osc.start(now); osc.stop(now + 0.4);
            },

            synthEmpty(now, master) {
                const osc = audioCtx.createOscillator();
                const env = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(50, now + 0.05);
                env.gain.setValueAtTime(0.2, now);
                env.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.connect(env);
                env.connect(master);
                osc.start(now);
                osc.stop(now + 0.05);
            },

            synthDeathLoss(now, master) {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(110, now + 0.8);
                osc.frequency.exponentialRampToValueAtTime(55, now + 2.0);
                g.gain.setValueAtTime(0.3, now);
                g.gain.linearRampToValueAtTime(0.5, now + 0.1);
                g.gain.exponentialRampToValueAtTime(0.01, now + 2.0);
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1000, now);
                filter.frequency.linearRampToValueAtTime(200, now + 2.0);
                osc.connect(filter); filter.connect(g); g.connect(master);
                osc.start(now); osc.stop(now + 2.0);
            },

            synthShoot(now, master) {
                const osc = audioCtx.createOscillator();
                const noise = this.createNoiseBuffer();
                const noiseNode = audioCtx.createBufferSource();
                const noiseGain = audioCtx.createGain();
                const env = audioCtx.createGain();
                const filter = audioCtx.createBiquadFilter();

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(2000, now);
                filter.frequency.exponentialRampToValueAtTime(100, now + 0.1);

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

                noiseNode.buffer = noise;
                noiseGain.gain.setValueAtTime(0.5, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

                env.gain.setValueAtTime(0.5, now);
                env.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

                osc.connect(filter);
                noiseNode.connect(noiseGain);
                noiseGain.connect(filter);
                filter.connect(env);
                env.connect(master);

                const g = audioCtx.createGain();
                g.gain.setValueAtTime(0.15, now);
                g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                noiseNode.connect(filter);
                filter.connect(g);
                g.connect(master);
                noiseNode.start(now);
                noiseNode.stop(now + 0.1);
            },

            createNoiseBuffer() {
                const bufferSize = audioCtx.sampleRate * 0.1;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                return buffer;
            },

            synthHit(now, master) {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
                g.gain.setValueAtTime(0.2, now);
                g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.connect(g); g.connect(master);
                osc.start(now); osc.stop(now + 0.1);
            },

            synthDeath(now, master) {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                g.gain.setValueAtTime(0.3, now);
                g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.connect(g); g.connect(master);
                osc.start(now); osc.stop(now + 0.3);
            },

            synthRecharge(now, master) {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
                g.gain.setValueAtTime(0.2, now);
                g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.connect(g); g.connect(master);
                osc.start(now); osc.stop(now + 0.2);
            },

            synthUI(now, master) {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                g.gain.setValueAtTime(0.1, now);
                g.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.connect(g); g.connect(master);
                osc.start(now); osc.stop(now + 0.05);
            },

            synthDeathLoss(now, master) {
                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(110, now + 0.8);
                osc.frequency.exponentialRampToValueAtTime(55, now + 2);
                
                g.gain.setValueAtTime(0.3, now);
                g.gain.linearRampToValueAtTime(0.5, now + 0.1);
                g.gain.exponentialRampToValueAtTime(0.01, now + 2);
                
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1000, now);
                filter.frequency.linearRampToValueAtTime(200, now + 2);
                
                osc.connect(filter); filter.connect(g); g.connect(master);
                osc.start(now); osc.stop(now + 2);
            }
        };

        const MusicEngine = {
            isPlaying: false, intensity: 1.0, bpm: 128, gain: null,
            init() { if (this.gain) return; this.gain = audioCtx.createGain(); this.gain.connect(audioCtx.destination); this.gain.gain.value = 0.15; },
            start() { if (this.isPlaying) return; this.init(); this.isPlaying = true; this.scheduleLoop(audioCtx.currentTime); },
            stop() {
                this.isPlaying = false;
                if (this.timeoutId) clearTimeout(this.timeoutId);
                if (this.gain) this.gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
            },
            scheduleLoop(time) {
                if (!this.isPlaying) return;
                const stepLen = 60 / (this.bpm * (this.intensity > 1.2 ? 1.5 : 1)) / 4;
                for (let i = 0; i < 16; i++) { this.playStep(time + i * stepLen, i); }
                this.timeoutId = setTimeout(() => this.scheduleLoop(time + 16 * stepLen), (16 * stepLen * 1000) - 50);
            },
            playStep(time, i) {
                if (i % 4 === 0) this.synthDrum(time, 60, 0.3, 0.12);
                if (i % 8 === 4) this.synthNoise(time, 0.1, 0.08);
                const notes = this.intensity > 1.2 ? [40, 43, 40, 48] : [40, 40, 40, 40];
                const freq = 440 * Math.pow(2, (notes[Math.floor(i / 4)] - 69) / 12);
                this.synthBass(time, freq, 0.1, 0.08);
            },
            synthDrum(t, f, d, v) { const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(0.01, t + d); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.01, t + d); o.connect(g); g.connect(this.gain); o.start(t); o.stop(t + d); },
            synthBass(t, f, d, v) { const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.01, t + d); o.connect(g); g.connect(this.gain); o.start(t); o.stop(t + d); },
            synthNoise(t, d, v) { const b = audioCtx.createBuffer(1, audioCtx.sampleRate * d, audioCtx.sampleRate); const dt = b.getChannelData(0); for (let i = 0; i < dt.length; i++) dt[i] = Math.random() * 2 - 1; const s = audioCtx.createBufferSource(); s.buffer = b; const g = audioCtx.createGain(); const f = audioCtx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1000; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.01, t + d); s.connect(f); f.connect(g); g.connect(this.gain); s.start(t); }
        };

        // Pre-asignación de objetos temporales para evitar Garbage Collection (Tarea 7.3)
        const _v1 = new THREE.Vector3();
        const _v2 = new THREE.Vector3();
        const _v3 = new THREE.Vector3();
        const _qTemp = new THREE.Quaternion(); // Tarea 12.1
        const _qTemp2 = new THREE.Quaternion(); // Tarea 12.1
        const _dirTemp = new THREE.Vector3(); // Cambio de nombre para evitar colisión
        const _box = new THREE.Box3();
        const _raycaster = new THREE.Raycaster();

        // 1. Configuración básica de la escena
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB); // Cielo azul claro
        scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

        // 2. Cámara (Vista cenital / Isométrica)
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        const cameraOffset = new THREE.Vector3(0, 15, 12); // Arriba 15m, Atrás 12m
        camera.position.copy(cameraOffset);
        camera.lookAt(0, 0, 0);

        // 3. Renderizador
        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true; // Activar sombras
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombras suaves
        document.body.appendChild(renderer.domElement);

        // 4. Luces
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Luz de ambiente clara
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(20, 30, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100;
        const d = 30; // Área de la luz direccional visible
        directionalLight.shadow.camera.left = -d;
        directionalLight.shadow.camera.right = d;
        directionalLight.shadow.camera.top = d;
        directionalLight.shadow.camera.bottom = -d;
        scene.add(directionalLight);

        // 5. Entorno (Mapa/Suelo)
        const mapSize = 100;
        let ground = null;
        const walls = [];
        const grassBlocks = []; // Para detectar si estamos dentro
        const boxes = []; // Tarea 37: Cajas de supervivencia
        const powerCubes = []; // Tarea 37: Ítems que sueltan las cajas

        // Generador de texturas procedurales (Ladrillos)
        function createBrickTexture(baseColor, brickColor) {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');

            // Fondo (mortero/unión)
            ctx.fillStyle = baseColor;
            ctx.fillRect(0, 0, 128, 128);

            // Ladrillos
            ctx.fillStyle = brickColor;
            const rows = 4;
            const cols = 2;
            const brickW = 128 / cols;
            const brickH = 128 / rows;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    let ox = (r % 2 === 0) ? 0 : -brickW / 2;
                    ctx.fillRect(ox + c * brickW + 2, r * brickH + 2, brickW - 4, brickH - 4);
                    if (ox < 0) {
                        ctx.fillRect(ox + cols * brickW + 2, r * brickH + 2, brickW - 4, brickH - 4);
                    }
                }
            }

            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            return texture;
        }

        // Textura de césped (hojas)
        function createGrassTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#1B5E20';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#2E7D32';
            for (let i = 0; i < 30; i++) {
                ctx.fillRect(Math.random() * 64, Math.random() * 64, 4, 8);
            }
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            return texture;
        }
        const grassTexture = createGrassTexture();

        // Tarea 37.1: Textura de caja de cartón sellada
        function createCardboardTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');

            // Color base cartón
            ctx.fillStyle = '#C19A6B';
            ctx.fillRect(0, 0, 128, 128);

            // Bordes y sombras
            ctx.strokeStyle = '#8B6B4C';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, 124, 124);

            // Cinta de sellado (Precinto)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // Cinta semi-transparente
            ctx.fillRect(0, 50, 128, 28);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.strokeRect(0, 50, 128, 28);

            const texture = new THREE.CanvasTexture(canvas);
            return texture;
        }
        const cardboardTexture = createCardboardTexture();

        const wallTextureBrown = createBrickTexture('#3E2723', '#8B4513');
        const wallTextureGrey = createBrickTexture('#424242', '#D7CCC8');

        function createWall(x, z, width, depth) {
            const tex = wallTextureBrown.clone();
            tex.repeat.set(width / 2, depth / 2 || 1);

            const wallGeo = new THREE.BoxGeometry(width, 2.5, depth);
            const wallMat = new THREE.MeshStandardMaterial({
                map: tex,
                roughness: 0.8
            });
            const wall = new THREE.Mesh(wallGeo, wallMat);
            wall.position.set(x, 1.25, z);
            wall.castShadow = true;
            wall.receiveShadow = true;
            scene.add(wall);

            const bbox = new THREE.Box3().setFromObject(wall);
            walls.push({ mesh: wall, box: bbox });
        }

        function createGrass(x, z, width, depth) {
            const tex = grassTexture.clone();
            tex.repeat.set(width / 2, depth / 2);
            const grassGeo = new THREE.BoxGeometry(width, 0.5, depth);
            const grassMat = new THREE.MeshStandardMaterial({
                map: tex,
                transparent: true,
                opacity: 0.9
            });
            const grass = new THREE.Mesh(grassGeo, grassMat);
            grass.position.set(x, 0.25, z);
            scene.add(grass);

            const bbox = new THREE.Box3().setFromObject(grass);
            grassBlocks.push({ mesh: grass, box: bbox });
        }

        function buildMap() {
            if (ground) {
                scene.remove(ground);
                walls.forEach(w => scene.remove(w.mesh));
                walls.length = 0;
                grassBlocks.forEach(g => scene.remove(g.mesh));
                grassBlocks.length = 0;
            }

            // Suelo con patrón tipo tablero decorativo para dar aspecto de arena
            const groundGeometry = new THREE.PlaneGeometry(mapSize, mapSize);
            const groundMaterial = new THREE.MeshStandardMaterial({
                color: 0x8BC34A, roughness: 1.0,
            });
            ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            ground.matrixAutoUpdate = false;
            ground.updateMatrix();
            scene.add(ground);

            // Re-spawnear cajas
            spawnBoxes();

            const halfMap = mapSize / 2;

            // Paredes exteriores (límites del mapa)
            createWall(0, -halfMap, mapSize, 2);    // Norte
            createWall(0, halfMap, mapSize, 2);     // Sur
            createWall(-halfMap, 0, 2, mapSize);    // Oeste
            createWall(halfMap, 0, 2, mapSize);     // Este

            // Función para generar un grupo de paredes delgadas
            // type "L", "I", "U", "square", "block"
            const createGroup = (x, z, type, rotation) => {
                const wallThickness = 1.0;
                const wallLength = 4.0;

                const addBlock = (px, pz, width, depth) => {
                    const tex = wallTextureGrey.clone();
                    // Ajustar repetición según el lado más largo
                    const reps = Math.max(width, depth) / 2;
                    tex.repeat.set(width > depth ? reps : 1, depth > width ? reps : 1);

                    const block = new THREE.Mesh(
                        new THREE.BoxGeometry(width, 2.5, depth),
                        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 })
                    );
                    block.position.set(px, 1.25, pz);
                    block.matrixAutoUpdate = false;
                    block.updateMatrix();
                    block.castShadow = true;
                    block.receiveShadow = true;
                    scene.add(block);
                    block.castShadow = true;
                    block.receiveShadow = true;
                    scene.add(block);
                    const bbox = new THREE.Box3().setFromObject(block);
                    walls.push({ mesh: block, box: bbox });
                };

                const W = wallLength;
                const T = wallThickness;

                if (type === 'I') {
                    if (rotation === 0) addBlock(x, z, W, T);
                    else addBlock(x, z, T, W);
                } else if (type === 'L') {
                    if (rotation === 0) {
                        addBlock(x, z, W, T);
                        addBlock(x - W / 2 + T / 2, z + W / 2, T, W);
                    } else if (rotation === 1) {
                        addBlock(x, z, W, T);
                        addBlock(x + W / 2 - T / 2, z + W / 2, T, W);
                    } else if (rotation === 2) {
                        addBlock(x, z, W, T);
                        addBlock(x - W / 2 + T / 2, z - W / 2, T, W);
                    } else {
                        addBlock(x, z, W, T);
                        addBlock(x + W / 2 - T / 2, z - W / 2, T, W);
                    }
                } else if (type === 'U') {
                    if (rotation === 0) {
                        addBlock(x, z, W, T);
                        addBlock(x - W / 2 + T / 2, z + W / 2, T, W);
                        addBlock(x + W / 2 - T / 2, z + W / 2, T, W);
                    } else {
                        addBlock(x, z, W, T);
                        addBlock(x - W / 2 + T / 2, z - W / 2, T, W);
                        addBlock(x + W / 2 - T / 2, z - W / 2, T, W);
                    }
                } else if (type === 'square') {
                    addBlock(x, z - W / 2 + T / 2, W, T);
                    addBlock(x, z + W / 2 - T / 2, W, T);
                    addBlock(x - W / 2 + T / 2, z, T, W - T * 2);
                    addBlock(x + W / 2 - T / 2, z, T, W - T * 2);
                } else if (type === 'block') {
                    addBlock(x, z, W, W);
                }
            };

            // ---- MAPA FIJO Y DISEÑADO ----
            // Zona central
            createGroup(0, -10, 'U', 0);
            createGroup(0, 10, 'U', 1);
            createGroup(-15, 0, 'I', 1);
            createGroup(15, 0, 'I', 1);

            // Obstáculos laterales y esquinas diseñados para cobertura
            createGroup(-20, -20, 'L', 0);
            createGroup(20, -20, 'L', 1);
            createGroup(-20, 20, 'L', 2);
            createGroup(20, 20, 'L', 3);

            createGroup(-35, -5, 'square', 0);
            createGroup(35, 5, 'square', 0);

            createGroup(-10, -30, 'I', 0);
            createGroup(10, -30, 'I', 0);
            createGroup(-10, 30, 'I', 0);
            createGroup(10, 30, 'I', 0);

            createGroup(30, -25, 'block', 0);
            createGroup(-30, -25, 'I', 1);
            createGroup(30, 25, 'I', 1);

            // Tarea 15.3: Muros en las esquinas para evitar vacío
            createGroup(-40, -40, 'L', 0);
            createGroup(40, -40, 'L', 1);
            createGroup(-40, 40, 'L', 2);
            createGroup(40, 40, 'L', 3);

            // Añadir zonas de césped (arbustos) cerca de muros
            createGrass(0, 0, 6, 6); // Centro
            createGrass(-15, 10, 8, 4);
            createGrass(15, -10, 8, 4);
            createGrass(-20, -25, 10, 5);
            createGrass(20, 25, 10, 5);
            // Tarea 15.3: Más pasto en las esquinas
            createGrass(-40, -35, 6, 4);
            createGrass(40, 35, 6, 4);
            // Césped dentro de los huecos de los muros centrales (Tarea 13)
            createGrass(0, -11, 3, 2);
            createGrass(0, 11, 3, 2);
        }

        // Tarea 39: Evitar generar cajas dentro de muros
        function findSafePosition(radius, avoidWalls = true) {
            let attempts = 0;
            while (attempts < 100) {
                const x = (Math.random() - 0.5) * 85;
                const z = (Math.random() - 0.5) * 85;

                // Verificar muros
                let collision = false;
                if (avoidWalls) {
                    const checkBox = new THREE.Box3().setFromCenterAndSize(
                        new THREE.Vector3(x, 1, z),
                        new THREE.Vector3(radius * 2.5, 2, radius * 2.5) // Margen extra
                    );
                    for (let w of walls) {
                        if (w.box.intersectsBox(checkBox)) {
                            collision = true;
                            break;
                        }
                    }
                }

                if (!collision) return { x, z };
                attempts++;
            }
            return { x: 0, z: 0 };
        }

        function spawnBoxes() {
            // Limpiar cajas viejas
            boxes.forEach(b => scene.remove(b.mesh));
            boxes.length = 0;

            const boxCount = 5; // Tarea 15.1: Solamente 5 cajas en el mapa
            for (let i = 0; i < boxCount; i++) {
                const pos = findSafePosition(1.0, true); // Usar findSafePosition para cajas
                createPowerBox(pos.x, pos.z);
            }
        }

        function createPowerBox(x, z) {
            // Tarea 37.1: Caja más baja (1.5 de altura)
            const boxGeo = new THREE.BoxGeometry(2, 1.5, 2);
            const boxMat = new THREE.MeshStandardMaterial({
                map: cardboardTexture,
                roughness: 0.9,
                emissive: 0x000000
            });
            const boxMesh = new THREE.Mesh(boxGeo, boxMat);
            // Ajustar posición Y para que esté en el suelo (1.5 / 2 = 0.75)
            boxMesh.position.set(x, 0.75, z);
            boxMesh.castShadow = true;
            boxMesh.receiveShadow = true;
            scene.add(boxMesh);

            const bbox = new THREE.Box3().setFromObject(boxMesh);
            boxes.push({
                mesh: boxMesh,
                box: bbox,
                hp: 5200,
                maxHp: 5200,
                originalPos: new THREE.Vector3(x, 0.75, z),
                hitTime: 0
            });

            updateHPDisplay(boxMesh, 5200, 5200, "Caja");
        }

        function spawnPowerCube(pos) {
            const cubeGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const cubeMat = new THREE.MeshStandardMaterial({
                color: 0x00FF00,
                emissive: 0x00FF00,
                emissiveIntensity: 0.5
            });
            const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
            cubeMesh.position.set(pos.x, 1, pos.z);
            scene.add(cubeMesh);

            powerCubes.push({
                mesh: cubeMesh
            });
        }

        // 6. Personaje y Modelado (Tarea 10)
        // Tarea 20: Personaje Detallado Futurista
        function createDetailedBrawler(colorHex) {
            const group = new THREE.Group();
            const visualGroup = new THREE.Group();
            visualGroup.name = "visualGroup";
            group.add(visualGroup);

            // Materiales de la humana pelirroja
            const skinMat = new THREE.MeshStandardMaterial({ color: 0xffccaa }); // Piel clara
            const hairMat = new THREE.MeshStandardMaterial({ color: 0xd9381e, roughness: 0.9 }); // Rojo brillante (pelirroja)
            const shirtMat = new THREE.MeshStandardMaterial({ color: colorHex }); // Camiseta color equipo
            const pantMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 }); // Pantalón oscuro gris azulado
            const shoeMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb }); // Zapatillas blancas
            const jacketMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 }); // Chaqueta oscura
            const detailMat = new THREE.MeshStandardMaterial({ color: 0x00E5FF, emissive: 0x00E5FF, emissiveIntensity: 0.8 }); // Detalles neón
            const gunMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8, roughness: 0.3 });

            // Formas redondeadas (Sin usar BoxGeometry para el cuerpo)

            // 1. Cuerpo (Torso)
            // Forma base usando un cilindro suave
            const bodyGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 16);
            const body = new THREE.Mesh(bodyGeo, shirtMat);
            body.position.y = 1.0;
            visualGroup.add(body);

            // Chaqueta (Abrigo) - Un poco más grande que el cuerpo
            const jacketGeo = new THREE.CylinderGeometry(0.35, 0.43, 0.75, 16);
            const jacket = new THREE.Mesh(jacketGeo, jacketMat);
            jacket.position.y = 1.05;
            visualGroup.add(jacket);

            // Parte inferior del abrigo (faldas)
            const coatLowerGeo = new THREE.CylinderGeometry(0.43, 0.5, 0.5, 16, 1, true, -Math.PI/2, Math.PI);
            const coatLower = new THREE.Mesh(coatLowerGeo, jacketMat);
            coatLower.position.y = 0.6;
            visualGroup.add(coatLower);

            // Cuello de la chaqueta
            const collarGeo = new THREE.CylinderGeometry(0.25, 0.35, 0.15, 16);
            const collar = new THREE.Mesh(collarGeo, jacketMat);
            collar.position.y = 1.45;
            visualGroup.add(collar);

            // Cinturón
            const beltGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.1, 16);
            const belt = new THREE.Mesh(beltGeo, new THREE.MeshStandardMaterial({ color: 0x111 }));
            belt.position.y = 0.65;
            visualGroup.add(belt);

            // Detalles en la chaqueta (Pins/Botones neón)
            const pinGeo = new THREE.CircleGeometry(0.04, 8);
            const leftPin = new THREE.Mesh(pinGeo, detailMat);
            leftPin.position.set(-0.15, 1.2, 0.36);
            visualGroup.add(leftPin);

            const rightPin = new THREE.Mesh(pinGeo, detailMat);
            rightPin.position.set(0.12, 1.1, 0.38);
            visualGroup.add(rightPin);

            // 2. Cabeza (Redonda)
            const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
            const head = new THREE.Mesh(headGeo, skinMat);
            head.position.y = 1.6;
            visualGroup.add(head);

            // Pelo pelirrojo (Media esfera arriba y mechones)
            const hairGeoTop = new THREE.SphereGeometry(0.38, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            const hairTop = new THREE.Mesh(hairGeoTop, hairMat);
            hairTop.position.y = 1.6;
            visualGroup.add(hairTop);
            
            // Coleta/Cola de caballo trasera
            const ponytailGeo = new THREE.ConeGeometry(0.15, 0.5, 8);
            const ponytail = new THREE.Mesh(ponytailGeo, hairMat);
            ponytail.position.set(0, 1.5, -0.35);
            ponytail.rotation.x = -Math.PI / 4;
            visualGroup.add(ponytail);

            // Muñón/Moño arriba
            const bunGeo = new THREE.SphereGeometry(0.15, 12, 12);
            const bun = new THREE.Mesh(bunGeo, hairMat);
            bun.position.set(0, 1.95, -0.1);
            visualGroup.add(bun);

            // Ojos (Más detallados y expresivos)
            const scleraGeo = new THREE.SphereGeometry(0.05, 12, 12);
            const scleraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const pupilGeo = new THREE.SphereGeometry(0.025, 8, 8);
            const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
            
            const leftEyeBase = new THREE.Mesh(scleraGeo, scleraMat);
            leftEyeBase.position.set(-0.12, 1.65, 0.32);
            const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
            leftPupil.position.set(0, 0, 0.042);
            leftEyeBase.add(leftPupil);
            visualGroup.add(leftEyeBase);
            
            const rightEyeBase = new THREE.Mesh(scleraGeo, scleraMat);
            rightEyeBase.position.set(0.12, 1.65, 0.32);
            const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
            rightPupil.position.set(0, 0, 0.042);
            rightEyeBase.add(rightPupil);
            visualGroup.add(rightEyeBase);

            // Boca Abierta Sonriendo
            const mouthGroup = new THREE.Group();
            mouthGroup.position.set(0, 1.48, 0.34);
            mouthGroup.rotation.x = Math.PI / 1.8; // Seguir la curva de la cara
            visualGroup.add(mouthGroup);

            // Fondo oscuro de la boca
            const mouthBackGeo = new THREE.SphereGeometry(0.08, 12, 12);
            const mouthBackMat = new THREE.MeshBasicMaterial({ color: 0x330000 });
            const mouthBack = new THREE.Mesh(mouthBackGeo, mouthBackMat);
            mouthBack.scale.set(1, 0.6, 0.1); // Aplastar para que parezca el interior de la boca
            mouthGroup.add(mouthBack);

            // Labio superior e inferior (Torus grueso)
            const lipsGeo = new THREE.TorusGeometry(0.08, 0.025, 8, 16);
            const lipsMat = new THREE.MeshBasicMaterial({ color: 0x5D2906 });
            const lips = new THREE.Mesh(lipsGeo, lipsMat);
            lips.scale.set(1, 0.7, 1); // Hacerla un pelín más ancha que alta
            mouthGroup.add(lips);

            // Dientes (Una pequeña franja blanca arriba)
            const teethGeo = new THREE.BoxGeometry(0.08, 0.03, 0.01);
            const teethMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const teeth = new THREE.Mesh(teethGeo, teethMat);
            teeth.position.set(0, 0.02, 0.01); // Posición superior dentro de la boca
            mouthGroup.add(teeth);

            // Guardar ojos para animar
            group.userData.leftEye = leftEyeBase;
            group.userData.rightEye = rightEyeBase;
            group.userData.leftPupil = leftPupil;
            group.userData.rightPupil = rightPupil;

            // 3. Piernas (Cilíndricas)
            const legGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.6, 12);
            
            const leftLeg = new THREE.Mesh(legGeo, pantMat);
            leftLeg.position.set(-0.18, 0.3, 0);
            visualGroup.add(leftLeg);
            group.userData.leftLeg = leftLeg;

            const rightLeg = new THREE.Mesh(legGeo, pantMat);
            rightLeg.position.set(0.18, 0.3, 0);
            visualGroup.add(rightLeg);
            group.userData.rightLeg = rightLeg;

            // Zapatillas (Semisferas o cilindros aplanados)
            const shoeGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.15, 12);
            
            const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
            leftShoe.position.set(-0.18, 0.08, 0.05);
            visualGroup.add(leftShoe);
            
            const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
            rightShoe.position.set(0.18, 0.08, 0.05);
            visualGroup.add(rightShoe);

            // 4. Brazos (Cilíndricos)
            const armGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.6, 12);
            const sleeveGeoJacket = new THREE.CylinderGeometry(0.13, 0.12, 0.4, 12);
            
            // Brazo izquierdo (libre/relajado)
            const leftArmGroup = new THREE.Group();
            leftArmGroup.position.set(-0.5, 1.3, 0); // Un poco más afuera (-0.48 -> -0.5)
            const leftArm = new THREE.Mesh(armGeo, skinMat);
            leftArm.position.y = -0.3; // Desplazado desde el pivot
            leftArmGroup.add(leftArm);
            
            // Manga izquierda (Chaqueta)
            const leftSleeveJ = new THREE.Mesh(sleeveGeoJacket, jacketMat);
            leftSleeveJ.position.y = -0.2;
            leftArmGroup.add(leftSleeveJ);

            leftArmGroup.rotation.z = 0.25; // Más inclinado hacia afuera (0.15 -> 0.25)
            visualGroup.add(leftArmGroup);
            group.userData.leftArm = leftArmGroup;

            // Brazo derecho (Apuntando hacia adelante)
            const rightArmGroup = new THREE.Group();
            rightArmGroup.position.set(0.4, 1.3, 0); // Pivot en el hombro
            const rightArm = new THREE.Mesh(armGeo, skinMat);
            rightArm.position.y = -0.3;
            rightArmGroup.add(rightArm);
            
            // Manga derecha (Chaqueta)
            const rightSleeveJ = new THREE.Mesh(sleeveGeoJacket, jacketMat);
            rightSleeveJ.position.y = -0.2;
            rightArmGroup.add(rightSleeveJ);

            rightArmGroup.rotation.x = -Math.PI / 2.2; // Levantado apuntando al frente
            rightArmGroup.rotation.z = -0.1;
            visualGroup.add(rightArmGroup);
            group.userData.rightArm = rightArmGroup;

            // Manos
            const handGeo = new THREE.SphereGeometry(0.11, 12, 12);
            const leftHand = new THREE.Mesh(handGeo, skinMat);
            leftHand.position.set(0, -0.6, 0);
            leftArmGroup.add(leftHand);

            const rightHand = new THREE.Mesh(handGeo, skinMat);
            rightHand.position.set(0, -0.6, 0);
            rightArmGroup.add(rightHand);

            // 5. Arma (Pistola firme en la mano derecha)
            function createElectricGun() {
                const gunGroup = new THREE.Group();
                
                // Empuñadura (Handle)
                const handleGeo = new THREE.BoxGeometry(0.06, 0.16, 0.08);
                const handle = new THREE.Mesh(handleGeo, gunMat);
                handle.position.set(0, -0.06, 0);
                handle.rotation.x = Math.PI / 8; // Inclinación típica de empuñadura
                gunGroup.add(handle);

                // Cuerpo superior de la pistola
                const pBodyGeo = new THREE.BoxGeometry(0.08, 0.08, 0.35);
                const pBody = new THREE.Mesh(pBodyGeo, gunMat);
                pBody.position.set(0, 0.05, 0.05); 
                gunGroup.add(pBody);
                
                // Cañón principal
                const barrelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 12);
                barrelGeo.rotateX(Math.PI / 2);
                const barrel = new THREE.Mesh(barrelGeo, gunMat);
                barrel.position.set(0, 0.05, 0.35);
                gunGroup.add(barrel);

                // Bobinas eléctricas
                const coilGeo = new THREE.TorusGeometry(0.04, 0.015, 8, 16);
                for(let i=0; i<3; i++) {
                    const coil = new THREE.Mesh(coilGeo, detailMat);
                    coil.position.set(0, 0.05, 0.25 + i*0.08);
                    gunGroup.add(coil);
                }

                // Luz frontal emissiva
                const glowGeo = new THREE.SphereGeometry(0.04, 8, 8);
                const glow = new THREE.Mesh(glowGeo, detailMat);
                glow.position.set(0, 0.05, 0.52);
                gunGroup.add(glow);
                
                return gunGroup;
            }

            const rightGun = createElectricGun();
            // Acomodar firmemente en la mano derecha
            rightGun.position.set(0, -0.6, 0.05); 
            rightGun.rotation.x = Math.PI / 2.2; // Compensar rotación del brazo para que apunte bien al frente
            rightArmGroup.add(rightGun);
            
            group.userData.rightGun = rightGun;
            group.userData.leftGun = null;

            // Guardar material para el efecto de daño
            group.userData.bodyMaterial = shirtMat;

            // Sombra
            const shadowGeo = new THREE.CircleGeometry(0.5, 16);
            shadowGeo.rotateX(-Math.PI/2);
            const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 });
            const shadow = new THREE.Mesh(shadowGeo, shadowMat);
            shadow.position.y = 0.01;
            visualGroup.add(shadow);

            return group;
        }

        // Tarea 20: Lógica de Animación
        function updateCharacterAnimation(group, state, time, delta) {
            const { leftLeg, rightLeg, leftArm, rightArm, rightGun, leftEye, rightEye, leftPupil, rightPupil } = group.userData;
            if(!leftLeg) return;

            // --- Animación de Ojos ---
            // Parpadeo: escala Y de los ojos
            const blinkTime = time % 4; // Periodo de 4 segundos
            const blinking = blinkTime > 3.8; // Parpadea al final del ciclo (0.2s)
            const blinkScale = blinking ? 0.1 : 1.0;
            if (leftEye) leftEye.scale.y = blinkScale;
            if (rightEye) rightEye.scale.y = blinkScale;

            // Movimiento de pupilas (nerviosismo/mirar alrededor)
            const eyeSeed = Math.floor(time * 0.5); // Cambia cada 2 segundos
            const eyePhase = (time * 0.5) % 1; 
            if (eyePhase < 0.1) { // Pequeño movimiento al inicio de la fase
                const offsetX = (Math.sin(eyeSeed * 7) * 0.01);
                const offsetY = (Math.cos(eyeSeed * 3) * 0.01);
                if (leftPupil) leftPupil.position.set(offsetX, offsetY, 0.042);
                if (rightPupil) rightPupil.position.set(offsetX * 1.1, offsetY * 0.9, 0.042);
            }

            switch(state) {
                case 'idle':
                    const breathe = Math.sin(time * 2) * 0.05;
                    group.getObjectByName("visualGroup").position.y = breathe;
                    leftArm.rotation.x = Math.sin(time) * 0.1;
                    leftArm.rotation.z = 0.25; // Reset a posición inicial
                    // El brazo derecho apuntando sube y baja un poco con la respiración
                    rightArm.rotation.x = -Math.PI / 2.2 + Math.sin(time) * 0.05;
                    break;
                case 'salute':
                    // Levantar mano izquierda y saludar (Waving)
                    leftArm.rotation.x = -Math.PI / 1.1;
                    leftArm.rotation.z = 0.2 + Math.sin(time * 12) * 0.4;
                    // El brazo derecho se mantiene un poco más bajo
                    rightArm.rotation.x = -Math.PI / 3;
                    break;
                case 'walk':
                    const walkSpeed = 12;
                    const legRot = Math.sin(time * walkSpeed) * 0.5;
                    leftLeg.rotation.x = legRot;
                    rightLeg.rotation.x = -legRot;
                    
                    // Balanceo de brazo izquierdo
                    leftArm.rotation.x = -legRot * 0.8;
                    // Brazo derecho (arma) se mantiene bastante estable, pequeño balanceo
                    rightArm.rotation.x = -Math.PI / 2.2 + Math.abs(Math.sin(time * walkSpeed)) * 0.1;
                    
                    group.getObjectByName("visualGroup").position.y = Math.abs(Math.sin(time * walkSpeed)) * 0.1;
                    break;
                case 'attack':
                    // Recoil impactante para brazo y arma
                    const recoil = Math.sin(time * 25) * 0.15;
                    // El retroceso empuja el arma hacia atrás localmente
                    if (rightGun) rightGun.position.z = 0.05 + Math.max(0, recoil);
                    // Y levanta sutilmente el brazo
                    rightArm.rotation.x = -Math.PI / 2.2 - Math.max(0, recoil * 0.6);
                    break;
            }
        }

        let playerGroup = null;
        let playerVisible = true;
        function spawnPlayerAt(x, z) {
            if (playerGroup) scene.remove(playerGroup);
            playerGroup = createDetailedBrawler(0x00FF88);
            playerGroup.position.set(x, 0, z);
            playerGroup.name = "Jugador"; // Store name for easier access
            scene.add(playerGroup);
            updateHPDisplay(playerGroup, MAX_HP, MAX_HP, "Tú");
            updateAmmoDisplay(playerGroup, MAX_AMMO, MAX_AMMO, 0, true);
        }

        // 7. Controles de Movimiento y variables de estado
        const moveSpeed = 7;
        const keys = { w: false, a: false, s: false, d: false };
        let isPlaying = false;
        let lastInputTime = Date.now();
        let gameOver = false; // New global variable for game over state

        function updateActivity() {
            lastInputTime = Date.now();
        }
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('mousedown', updateActivity);
        window.addEventListener('mousemove', updateActivity);

        // 7.5. Sistema de Disparo
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const bullets = [];
        const bulletSpeed = 25;
        const bulletRange = 10; // 3 metros visuales

        // Sistema de munición (Tarea 23: Estilo Brawl Stars)
        const MAX_AMMO = 3;
        const RECHARGE_TIME = 2000; // 2 segundos por carga
        let playerAmmo = MAX_AMMO;

        // --- Tarea 20: Previsualización 3D en el Menú ---
        let menuScene, menuCamera, menuRenderer, menuBrawler;
        function initMenu3D() {
            const container = document.getElementById('start-menu');
            menuScene = new THREE.Scene();
            menuCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
            menuCamera.position.set(0, 1.2, 4);
            
            menuRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            menuRenderer.setSize(window.innerWidth, window.innerHeight);
            menuRenderer.setPixelRatio(window.devicePixelRatio);
            menuRenderer.domElement.style.position = 'absolute';
            menuRenderer.domElement.style.top = '0';
            menuRenderer.domElement.style.left = '0';
            menuRenderer.domElement.style.zIndex = '-1'; // Detrás de los botones
            container.appendChild(menuRenderer.domElement);

            const ambient = new THREE.AmbientLight(0xffffff, 0.8);
            menuScene.add(ambient);
            const directional = new THREE.DirectionalLight(0xffffff, 1);
            directional.position.set(5, 10, 7.5);
            menuScene.add(directional);

            menuBrawler = createDetailedBrawler(0x00FF88);
            menuBrawler.position.y = -0.2; // Subido más (-0.35 -> -0.2)
            menuBrawler.scale.set(0.92, 0.92, 0.92);
            menuScene.add(menuBrawler);

            let currentMenuState = 'idle';
            let currentRotationTarget = 0.5;
            let stateEndTime = 0;

            // --- Interacción de Rotación (360 Grados con Inercia) ---
            let isDragging = false;
            let previousMouseX = 0;
            let rotationVelocity = 0;
            const friction = 0.94; // Factor de frenado
            const sensitivity = 0.007; // Sensibilidad más baja para control suave

            container.addEventListener('mousedown', (e) => {
                isDragging = true;
                previousMouseX = e.clientX;
                rotationVelocity = 0; // Detener inercia actual al tocar
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const deltaX = e.clientX - previousMouseX;
                previousMouseX = e.clientX;
                
                // Calcular velocidad basada en el movimiento del ratón
                rotationVelocity = deltaX * sensitivity;
                
                // Aplicar rotación inmediata
                menuBrawler.rotation.y += rotationVelocity;
                currentRotationTarget = menuBrawler.rotation.y;
            });

            window.addEventListener('mouseup', () => {
                isDragging = false;
            });

            function animateMenu() {
                if (container.style.display !== 'none') {
                    requestAnimationFrame(animateMenu);
                    const nowSec = Date.now() * 0.001;

                    // Lógica de inercia tras soltar el ratón
                    if (!isDragging) {
                        // Aplicar velocidad a la rotación
                        menuBrawler.rotation.y += rotationVelocity;
                        // Aplicar fricción para ir frenando
                        rotationVelocity *= friction;
                        
                        // Si la velocidad es ínfima, limpiar
                        if (Math.abs(rotationVelocity) < 0.0001) rotationVelocity = 0;
                        
                        // Sincronizar target mientras dure la inercia
                        if (Math.abs(rotationVelocity) > 0) {
                            currentRotationTarget = menuBrawler.rotation.y;
                        }
                    }

                    // Lógica de cambio de estado de animación ocasional
                    // No cambiar de estado automáticamente si el usuario está arrastrando o hay mucha inercia
                    if (nowSec > stateEndTime && !isDragging && Math.abs(rotationVelocity) < 0.005) {
                        if (currentMenuState !== 'idle') {
                            currentMenuState = 'idle';
                            stateEndTime = nowSec + 3 + Math.random() * 4;
                        } else {
                            const rand = Math.random();
                            if (rand < 0.3) {
                                currentMenuState = 'salute';
                                stateEndTime = nowSec + 2.5;
                            } else if (rand < 0.6) {
                                currentMenuState = 'attack';
                                stateEndTime = nowSec + 1.2;
                            } else {
                                currentRotationTarget = (Math.random() - 0.5) * 1.5;
                                stateEndTime = nowSec + 2;
                            }
                        }
                    }

                    // Ejecutar animación actual
                    updateCharacterAnimation(menuBrawler, currentMenuState, nowSec, 0.016);

                    // Suavizar la rotación hacia el objetivo (Idler automático)
                    // Solo aplicar si no estamos arrastrando ni hay inercia significativa
                    if (!isDragging && Math.abs(rotationVelocity) < 0.001) {
                        menuBrawler.rotation.y += (currentRotationTarget - menuBrawler.rotation.y) * 0.05;
                    }

                    menuRenderer.render(menuScene, menuCamera);
                }
            }
            animateMenu();
        }
        initMenu3D();
        let playerRechargeProgress = 0; // 0 a 1
        let playerReloading = false; // Tarea 23: Estado de recarga
        let playerLastShot = 0; // Para sigilo y recarga

        // Tarea 17: Mostrar Menú de Derrota con Animación
        function showLossMenu() {
            const lossMenu = document.getElementById('loss-menu');
            lossMenu.style.display = 'flex';
            SoundEngine.play('death_loss');
            MusicEngine.stop();
        }

        document.getElementById('loss-return-btn').addEventListener('click', () => {
            location.reload();
        });

        // Daño fijo de 600 (Tarea 23)
        const spreadDamage = [600, 600, 600, 600, 600];
        const spreadAngles = [0, -0.15, 0.15, -0.3, 0.3];

        const bulletGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const bulletMaterial = new THREE.MeshStandardMaterial({
            color: 0x00E5FF,
            emissive: 0x00E5FF,
            emissiveIntensity: 1.0,
            roughness: 0.2
        });

        // --- Pool de Balas (Tarea 7.2) ---
        const bulletPool = [];
        const MAX_BULLET_POOL = 100;

        function getBulletFromPool(color) {
            let b;
            if (bulletPool.length > 0) {
                b = bulletPool.pop();
                b.material.color.setHex(color);
                b.material.emissive.setHex(color);
                b.visible = true;
            } else {
                const mat = new THREE.MeshStandardMaterial({ 
                    color: color, 
                    emissive: color, 
                    emissiveIntensity: 0.8,
                    transparent: false 
                });
                b = new THREE.Mesh(bulletGeometry, mat);
            }
            return b;
        }

        function returnBulletToPool(bulletObj) {
            bulletObj.visible = false;
            if (bulletPool.length < MAX_BULLET_POOL) {
                bulletPool.push(bulletObj);
            } else {
                bulletObj.geometry.dispose();
                bulletObj.material.dispose();
                scene.remove(bulletObj);
            }
        }

        // Función para disparar una ráfaga de proyectiles
        function fireSpread(originPos, aimDirection, ownerType, ownerName) {
            const baseDmg = 500; // Tarea 13.1: Daño base reducido para paridad y ritmo táctico
            for (let s = 0; s < spreadAngles.length; s++) {
                const angle = spreadAngles[s];
                
                _dirTemp.copy(aimDirection);
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const rx = _dirTemp.x * cos - _dirTemp.z * sin;
                const rz = _dirTemp.x * sin + _dirTemp.z * cos;
                
                const col = ownerType === 'player' ? 0x00E5FF : (ownerType === 'enemy' ? 0xFF4444 : 0xFFFFFF);
                const bMesh = getBulletFromPool(col);
                
                // Tarea 9.1: Punto de disparo adelantado para mayor naturalidad
                const forwardOffset = 0.8;
                bMesh.position.set(
                    originPos.x + aimDirection.x * forwardOffset, 
                    1, 
                    originPos.z + aimDirection.z * forwardOffset
                );
                
                if (!bMesh.parent) scene.add(bMesh);

                bullets.push({
                    mesh: bMesh,
                    dir: new THREE.Vector3(rx, 0, rz),
                    traveled: 0,
                    type: ownerType,
                    owner: ownerName,
                    // Tarea 11.1: Paridad absoluta de daño. Bots y Jugador usan la misma lógica
                    damage: baseDmg * (ownerType === 'player' ? playerDamageMultiplier : (enemies.find(e => e.name === ownerName)?.damageMultiplier || 1.0))
                });
            }
        }

        // Declaración unificada de variables globales y UI
        const MAX_HP = 5000;
        const enemies = [];
        const brawlersLeftDisplay = document.getElementById('brawlers-left');
        const uiContainer = document.getElementById('ui-container');
        const gameStats = document.getElementById('game-stats');
        const killFeedContainer = document.getElementById('kill-feed');

        let playerHP = MAX_HP;
        let playerMaxHP = MAX_HP;
        let playerDamageMultiplier = 1.0;
        let playerLastDamageTime = 0;
        let playerLastRegenBurstTime = 0;
        let playerHitTime = 0; // Tarea 38
        let playerOriginalPos = new THREE.Vector3();
        let playerLastPos = new THREE.Vector3(); // Tarea FIX AI: Para velocidad
        let screenShake = 0; // Tarea 34: Intensidad de sacudida
        let globalTimeScale = 1.0; // Tarea 41: Para efecto Slow-Mo

        window.addEventListener('mousemove', (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button !== 0 || !isPlaying || playerHP <= 0) return;

            if (playerAmmo < 1) {
                // Tarea 13.2: Feedback de munición vacía suavizado (menos sacudida)
                SoundEngine.play('empty');
                screenShake = 0.2; 
                
                const ammoUI = playerGroup.getObjectByName('ammoDisplay');
                if (ammoUI) {
                    // Tarea 14.2: Usar posición absoluta 0 para evitar que la barra se "vaya de lugar" (drift)
                    const targetX = 0; 
                    const startTime = Date.now();
                    const shake = () => {
                        const elapsed = Date.now() - startTime;
                        if (elapsed < 200) {
                            // Tarea 13.2: Vibración de la barra reducida para evitar distorsión
                            ammoUI.position.x = targetX + (Math.sin(elapsed * 0.1) * 0.15);
                            requestAnimationFrame(shake);
                        } else {
                            ammoUI.position.x = targetX;
                        }
                    };
                    shake();
                }
                return;
            }

            raycaster.setFromCamera(mouse, camera);
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            const intersectPoint = new THREE.Vector3();
            raycaster.ray.intersectPlane(plane, intersectPoint);

            if (intersectPoint) {
                playerLastShot = Date.now();
                const direction = new THREE.Vector3().subVectors(intersectPoint, playerGroup.position);
                direction.y = 0;
                direction.normalize();

                fireSpread(playerGroup.position, direction, 'player', 'Tú');
                SoundEngine.play('shoot');

                playerAmmo = Math.max(0, playerAmmo - 1);
                updateAmmoDisplay(playerGroup, playerAmmo, MAX_AMMO, playerRechargeProgress, true);
            }
        });

        // Tarea 14: Sistema de Nombres
        const botNamesMaster = ["Pepitogamer123", "ElProEnTodo", "Caviar12", "Daniel_XX", "JuanXZ", "BrawlerX", "SuperN00b", "NinjaShadow", "GamerPro", "DarkKnight", "SpikeJr", "ColtFan"];
        let currentBotNames = [];

        function addKillEntry(killer, victim) {
            const entry = document.createElement('div');
            entry.className = 'kill-item';
            if (killer === 'Tú' || victim === 'Tú') {
                entry.classList.add('player-action');
            }
            entry.innerHTML = `<span class="killer">${killer}</span> <span style="color:rgba(255,255,255,0.9); font-size: 0.85rem; margin: 0 4px; letter-spacing: 1px; font-weight: 700;">ELIMINÓ A</span> <span class="victim">${victim}</span>`;
            killFeedContainer.appendChild(entry);
            setTimeout(() => { if (entry.parentNode) entry.remove(); }, 4500);
        }

        // Tarea 22/23: Indicador de vida 3D con NÚMERO mediante Sprite
        function updateHPDisplay(characterMesh, hp, maxHp, name = "") {
            let hpGroup = characterMesh.getObjectByName('hpDisplay');
            if (!hpGroup) {
                hpGroup = new THREE.Group();
                hpGroup.name = 'hpDisplay';

                // Fondo rojo (daño)
                const bgGeo = new THREE.PlaneGeometry(2, 0.2);
                // Tarea 11.2: depthTest: false y renderOrder para que siempre se vea arriba
                const bgMat = new THREE.MeshBasicMaterial({ color: 0x440000, depthTest: false, transparent: true });
                const bg = new THREE.Mesh(bgGeo, bgMat);
                bg.name = 'bg';
                bg.renderOrder = 999;
                hpGroup.add(bg);

                // Barra verde (vida)
                const fgGeo = new THREE.PlaneGeometry(2, 0.2);
                const fgMat = new THREE.MeshBasicMaterial({ color: 0x00FF00, depthTest: false, transparent: true });
                const fg = new THREE.Mesh(fgGeo, fgMat);
                fg.name = 'fg';
                fg.position.z = 0.01;
                fg.renderOrder = 1000;
                hpGroup.add(fg);

                // Sprite para el número de vida
                const hpCanvas = document.createElement('canvas');
                hpCanvas.width = 256;
                hpCanvas.height = 64;
                const hpCtx = hpCanvas.getContext('2d');
                const hpTex = new THREE.CanvasTexture(hpCanvas);
                // Tarea 11.2: depthTest: false para sprites
                const hpSpriteMat = new THREE.SpriteMaterial({ map: hpTex, depthTest: false, transparent: true });
                const hpSprite = new THREE.Sprite(hpSpriteMat);
                hpSprite.name = 'hpValueSprite';
                hpSprite.renderOrder = 1001;
                hpSprite.scale.set(2, 0.5, 1);
                hpSprite.position.y = 0.4; // Sobre la barra
                hpGroup.add(hpSprite);

                // Tarea 32: Sprite para el nombre del personaje
                const nameCanvas = document.createElement('canvas');
                nameCanvas.width = 512;
                nameCanvas.height = 64;
                const nameCtx = nameCanvas.getContext('2d');
                const nameTex = new THREE.CanvasTexture(nameCanvas);
                const nameSpriteMat = new THREE.SpriteMaterial({ map: nameTex, depthTest: false, transparent: true });
                const nameSprite = new THREE.Sprite(nameSpriteMat);
                nameSprite.name = 'nameSprite';
                nameSprite.renderOrder = 1002;
                nameSprite.scale.set(4, 0.5, 1);
                nameSprite.position.y = 1.0; // Encima del número de vida
                hpGroup.add(nameSprite);

                hpGroup.position.set(0, 4.2, 0); // Tarea 11.3: Más alto para evitar clipping visual con el cuerpo
                characterMesh.add(hpGroup);
            }

            const fg = hpGroup.getObjectByName('fg');
            const pct = Math.max(0, hp / maxHp);
            fg.scale.x = pct;
            fg.position.x = (pct - 1);

            // Actualizar número en el sprite solo si cambia
            const hpSprite = hpGroup.getObjectByName('hpValueSprite');
            if (hpSprite) {
                const roundedHP = Math.round(hp);
                if (hpSprite.userData.lastValue !== roundedHP) {
                    const canvas = hpSprite.material.map.image;
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 40px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(roundedHP.toString(), 128, 45);
                    hpSprite.material.map.needsUpdate = true;
                    hpSprite.userData.lastValue = roundedHP;
                }
            }

            // Actualizar nombre en el sprite solo si cambia o es la primera vez
            const nameSprite = hpGroup.getObjectByName('nameSprite');
            if (nameSprite && name) {
                if (nameSprite.userData.lastName !== name) {
                    const canvas = nameSprite.material.map.image;
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#f0f0f0';
                    ctx.font = 'bold 36px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(name, 256, 45);
                    nameSprite.material.map.needsUpdate = true;
                    nameSprite.userData.lastName = name;
                }
            }
        }

        // Tarea 23: Indicador de munición (Symmetry & Clarity)
        function updateAmmoDisplay(characterMesh, ammo, maxAmmo, progress = 0, isPlayer = false) {
            if (!isPlayer) return;
            
            let group = characterMesh.getObjectByName('ammoDisplay');
            const spacing = 0.7;
            const totalWidth = (maxAmmo - 1) * spacing;

            if (!group) {
                group = new THREE.Group();
                group.name = 'ammoDisplay';
                const width = 0.6;
                const height = 0.15;

                for (let k = 0; k < maxAmmo; k++) {
                    const bgGeo = new THREE.PlaneGeometry(width, height);
                    const bgMat = new THREE.MeshBasicMaterial({ color: 0x332200, transparent: true, opacity: 0.6, depthTest: false });
                    const rectBg = new THREE.Mesh(bgGeo, bgMat);
                    rectBg.renderOrder = 999;
                    rectBg.position.set((k * spacing) - totalWidth / 2, 0, 0);
                    group.add(rectBg);

                    const fgGeo = new THREE.PlaneGeometry(width, height);
                    const fgMat = new THREE.MeshBasicMaterial({ color: 0xFF9800, depthTest: false, transparent: true });
                    const rectFg = new THREE.Mesh(fgGeo, fgMat);
                    rectFg.name = 'fill_' + k;
                    rectFg.renderOrder = 1000;
                    rectFg.position.set((k * spacing) - totalWidth / 2, 0, 0.01);
                    group.add(rectFg);
                }
                group.position.set(0, 3.1, 0);
                characterMesh.add(group);
            }

            const width = 0.6;
            for (let k = 0; k < maxAmmo; k++) {
                const rectFg = group.getObjectByName('fill_' + k);
                if (rectFg) {
                    let fillPct = 0;
                    if (k < Math.floor(ammo)) fillPct = 1;
                    else if (k === Math.floor(ammo)) fillPct = progress;

                    if (fillPct > 0) {
                        rectFg.visible = true;
                        rectFg.scale.x = fillPct;
                        // Tarea 14.1: Carga desde la izquierda (ajustar posición x segun el escalado)
                        const baseX = (k * spacing) - totalWidth / 2;
                        rectFg.position.x = baseX - (width / 2 * (1 - fillPct));
                    } else {
                        rectFg.visible = false;
                    }
                }
            }
        }

        function updateSurvivorCount() {
            const total = enemies.filter(e => !e.dead).length + (isPlaying ? 1 : 0);
            brawlersLeftDisplay.innerText = `${total} Brawlers restantes`;

            // Animación de pulso
            brawlersLeftDisplay.classList.remove('pulse');
            void brawlersLeftDisplay.offsetWidth; // Force reflow
            brawlersLeftDisplay.classList.add('pulse');
            setTimeout(() => brawlersLeftDisplay.classList.remove('pulse'), 300);
        }
        const startMenu = document.getElementById('start-menu');
        const startBtn = document.getElementById('start-btn');

        startBtn.addEventListener('click', () => {
            // Tarea 10.4: Staggered Loading para evitar congelamiento inicial
            // 1. Mostrar UI inmediatamente
            startMenu.style.display = 'none';
            uiContainer.style.display = 'block';
            gameStats.style.display = 'block';
            
            isPlaying = false; // Detener procesamiento hasta terminar carga
            gameOver = false;
            gameStartTime = Date.now();
            lastInputTime = Date.now();

            if (audioCtx.state === 'suspended') audioCtx.resume();
            SoundEngine.play('ui');
            MusicEngine.start();

            // 2. Carga pesada en el siguiente ciclo para no bloquear el pintado de la UI
            setTimeout(() => {
                despawnWorld();
                buildMap();
                spawnBoxes();

                const spawnPoints = getDiverseSpawnPoints(10);
                const pSpawn = spawnPoints[0] || { x: 0, z: 0 };
                spawnPlayerAt(pSpawn.x, pSpawn.z);

                // Reset de estado del Jugador
                playerHP = MAX_HP;
                playerMaxHP = MAX_HP;
                playerDamageMultiplier = 1.0;
                playerAmmo = MAX_AMMO;
                playerReloading = false;
                playerRechargeProgress = 0;
                playerHitTime = 0;
                playerLastShot = 0;
                showdownTriggered = false;
                globalTimeScale = 1.0;
                screenShake = 0;

                if (playerGroup) {
                    playerOriginalPos.copy(playerGroup.position);
                    playerLastPos.copy(playerGroup.position);
                    camera.position.set(playerGroup.position.x + cameraOffset.x, 15, playerGroup.position.z + cameraOffset.z);
                    camera.lookAt(playerGroup.position);
                }

                // 3. Mezclar nombres y colores para bots
                currentBotNames = [...botNamesMaster].sort(() => Math.random() - 0.5);
                const botColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0x888888, 0xFFFFFF, 0x444444];

                // 4. Spawning escalonado de bots (Tarea 10.4)
                let bIdx = 1;
                const spawnNextBot = () => {
                    if (bIdx < 10) {
                        const bSpawn = spawnPoints[bIdx] || { x: (Math.random() - 0.5) * 40, z: (Math.random() - 0.5) * 40 };
                        spawnBot(botColors[bIdx - 1], currentBotNames[bIdx - 1], bSpawn);
                        bIdx++;
                        setTimeout(spawnNextBot, 20); // 20ms entre cada bot
                    } else {
                        // Carga terminada, activar gameplay
                        isPlaying = true;
                        updateSurvivorCount();
                    }
                };
                spawnNextBot();
            }, 60);

            document.getElementById('afk-warning').style.display = 'none';
            document.getElementById('afk-error').style.display = 'none';
        });

        document.getElementById('afk-return-btn').addEventListener('click', () => {
            despawnWorld();
            document.getElementById('afk-error').style.display = 'none';
            startMenu.style.display = 'flex';
            const header = document.querySelector('#start-menu h1');
            header.innerText = "";
            header.style.display = 'none';
            startBtn.innerText = "JUGAR";
        });

        function findSafeSpawn() {
            let attempts = 0;
            while (attempts < 50) {
                const x = (Math.random() - 0.5) * 80;
                const z = (Math.random() - 0.5) * 80;
                const r = 1.0;
                const box = new THREE.Box3(
                    new THREE.Vector3(x - r, 0, z - r),
                    new THREE.Vector3(x + r, 2, z + r)
                );
                let collision = false;
                for (let w of walls) {
                    if (w.box.intersectsBox(box)) {
                        collision = true;
                        break;
                    }
                }
                // También verificar colisión con cajas
                for (let b of boxes) {
                    if (b.box.intersectsBox(box)) {
                        collision = true;
                        break;
                    }
                }
                if (!collision) return { x, z };
                attempts++;
            }
            return { x: 0, z: 0 };
        }

        // Tarea 35: Algoritmo Greedy Max-Min para puntos alejados
        function getDiverseSpawnPoints(count) {
            const candidates = [];
            for (let i = 0; i < 60; i++) {
                candidates.push(findSafeSpawn());
            }

            const selected = [];
            // Primer punto aleatorio
            selected.push(candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0]);

            while (selected.length < count && candidates.length > 0) {
                let bestCandIdx = -1;
                let maxMinDist = -1;

                for (let i = 0; i < candidates.length; i++) {
                    const cand = candidates[i];
                    let minDistToSelected = Infinity;
                    for (const s of selected) {
                        const d = Math.sqrt((cand.x - s.x) ** 2 + (cand.z - s.z) ** 2);
                        if (d < minDistToSelected) minDistToSelected = d;
                    }

                    if (minDistToSelected > maxMinDist) {
                        maxMinDist = minDistToSelected;
                        bestCandIdx = i;
                    }
                }
                selected.push(candidates.splice(bestCandIdx, 1)[0]);
            }
            return selected;
        }

        function spawnBot(color, name, pos) {
            const group = createDetailedBrawler(color);
            group.position.set(pos.x, 0, pos.z);
            scene.add(group);

            // Tarea 13.3: Paridad de HP (Se eliminan los multiplicadores de vida por clase)
            const classes = ['BALANCED', 'TANK', 'SNIPER', 'BERSERKER'];
            const botClass = classes[Math.floor(Math.random() * classes.length)];
            let hpMult = 1.0, speedMult = 1.0, rangeOffset = 0, aggro = 0.5;
            let visualScale = 1.0; 

            if (botClass === 'TANK') {
                hpMult = 1.0; speedMult = 0.8; rangeOffset = -2; aggro = 0.8;
            } else if (botClass === 'SNIPER') {
                hpMult = 1.0; speedMult = 1.1; rangeOffset = 4; aggro = 0.3;
            } else if (botClass === 'BERSERKER') {
                hpMult = 1.0; speedMult = 1.2; rangeOffset = -4; aggro = 1.0;
            }

            group.scale.set(1, 1, 1);

            const enemyObj = {
                mesh: group,
                hp: MAX_HP * hpMult,
                maxHP: MAX_HP * hpMult,
                dead: false,
                name: name,
                class: botClass,
                state: 'PATROL',
                patrolPoint: new THREE.Vector3((Math.random() - 0.5) * 80, 0, (Math.random() - 0.5) * 80),
                lastDecision: Date.now(),
                speed: (4.5 + Math.random() * 0.5), // Tarea 8.4: Velocidad normalizada
                ammo: MAX_AMMO,
                lastShot: 0,
                rechargeProgress: 0,
                attackRange: (10 + Math.random() * 4) + rangeOffset,
                aggression: aggro,
                lastDamageTime: 0,
                lastRegenBurstTime: 0,
                damageMultiplier: 1.0,
                stuckTimer: 0,
                hitTime: 0,
                originalPos: group.position.clone(),
                lastPos: new THREE.Vector3()
            };
            enemies.push(enemyObj);
            updateHPDisplay(group, enemyObj.hp, enemyObj.maxHP, name);
            updateAmmoDisplay(group, MAX_AMMO, MAX_AMMO, 0, false);
        }

        function moveCharacter(ent, direction, dist) {
            const nextX = ent.mesh.position.x + direction.x * dist;
            const nextZ = ent.mesh.position.z + direction.z * dist;

            const r = 0.7;
            const boxX = new THREE.Box3(
                new THREE.Vector3(nextX - r, 0, ent.mesh.position.z - r),
                new THREE.Vector3(nextX + r, 2, ent.mesh.position.z + r)
            );
            const boxZ = new THREE.Box3(
                new THREE.Vector3(ent.mesh.position.x - r, 0, nextZ - r),
                new THREE.Vector3(ent.mesh.position.x + r, 2, nextZ + r)
            );

            let colX = false;
            let colZ = false;
            for (let w of walls) {
                if (w.box.intersectsBox(boxX)) colX = true;
                if (w.box.intersectsBox(boxZ)) colZ = true;
            }
            // También verificar colisión con cajas
            for (let b of boxes) {
                if (b.box.intersectsBox(boxX)) colX = true;
                if (b.box.intersectsBox(boxZ)) colZ = true;
            }

            const limit = (mapSize / 2) - 1.5;

            // Tarea 36: Mejora de colisión con "despegue" (rebote ligero)
            if (!colX) {
                ent.mesh.position.x = Math.max(-limit, Math.min(limit, nextX));
            } else {
                // Retroceder un poco para no quedar pegado (Tarea 8.5: Mejora navegación)
                ent.mesh.position.x -= direction.x * 0.05;
            }

            if (!colZ) {
                ent.mesh.position.z = Math.max(-limit, Math.min(limit, nextZ));
            } else {
                ent.mesh.position.z -= direction.z * 0.05;
            }

            // Tarea FIX FUSION: Colisión entre brawlers (Optimized)
            for (let j = 0; j < enemies.length; j++) {
                const other = enemies[j];
                if (other.dead || other.mesh === ent.mesh) continue;
                
                const distSq = ent.mesh.position.distanceToSquared(other.mesh.position);
                if (distSq < 1.44) { // 1.2 * 1.2 = 1.44
                    const d = Math.sqrt(distSq);
                    _v1.subVectors(ent.mesh.position, other.mesh.position).normalize();
                    const force = (1.2 - d) * 0.3;
                    ent.mesh.position.x = Math.max(-limit, Math.min(limit, ent.mesh.position.x + _v1.x * force));
                    ent.mesh.position.z = Math.max(-limit, Math.min(limit, ent.mesh.position.z + _v1.z * force));
                }
            }
            if (playerGroup && ent.mesh !== playerGroup) {
                const distSq = ent.mesh.position.distanceToSquared(playerGroup.position);
                if (distSq < 1.44) {
                    const d = Math.sqrt(distSq);
                    _v1.subVectors(ent.mesh.position, playerGroup.position).normalize();
                    const force = (1.2 - d) * 0.3;
                    ent.mesh.position.x = Math.max(-limit, Math.min(limit, ent.mesh.position.x + _v1.x * force));
                    ent.mesh.position.z = Math.max(-limit, Math.min(limit, ent.mesh.position.z + _v1.z * force));
                }
            }
        }

        function despawnWorld() {
            isPlaying = false;
            if (playerGroup) { scene.remove(playerGroup); playerGroup = null; }
            if (ground) { scene.remove(ground); ground = null; }
            walls.forEach(w => { scene.remove(w.mesh); }); walls.length = 0;
            grassBlocks.forEach(g => { scene.remove(g.mesh); }); grassBlocks.length = 0;
            boxes.forEach(b => { scene.remove(b.mesh); }); boxes.length = 0; // Limpiar cajas
            powerCubes.forEach(c => { scene.remove(c.mesh); }); powerCubes.length = 0; // Limpiar cubos
            enemies.forEach(e => { scene.remove(e.mesh); }); enemies.length = 0;
            bullets.forEach(b => { scene.remove(b.mesh); b.mesh.geometry.dispose(); b.mesh.material.dispose(); });
            bullets.length = 0;
        }

        window.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w': keys.w = true; break;
                case 'a': keys.a = true; break;
                case 's': keys.s = true; break;
                case 'd': keys.d = true; break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w': keys.w = false; break;
                case 'a': keys.a = false; break;
                case 's': keys.s = false; break;
                case 'd': keys.d = false; break;
            }
        });

        // 8. Bucle del Juego (Update y Render)
        const clock = new THREE.Clock(); // Para controlar el movimiento independiente de FPS

        let showdownTriggered = false;
        let gameStartTime = 0; // Declarar gameStartTime aquí

        function animate() {
            requestAnimationFrame(animate);
            if (gameOver) return;

            const now = Date.now();
            let delta = Math.min(0.05, clock.getDelta());
            
            // Aplicar TimeScale Global (Showdown / Efectos)
            delta *= globalTimeScale;

            // Reducir sacudida de pantalla
            if (screenShake > 0) {
                screenShake -= delta * 2;
                if (screenShake < 0) screenShake = 0;
            }

            if (isPlaying) {
                // --- LÓGICA DE SHOWDOWN (SOLO SI EL JUEGO ESTÁ ACTIVO) ---
                // --- LÓGICA DE SHOWDOWN (Optimized) ---
                let aliveCount = (playerHP > 0 ? 1 : 0);
                for (let j = 0; j < enemies.length; j++) if (!enemies[j].dead) aliveCount++;
                
                if (aliveCount === 2 && !showdownTriggered) {
                    showdownTriggered = true;
                    const overlay = document.getElementById('showdown-overlay');
                    if (overlay) {
                        overlay.classList.add('active');
                        SoundEngine.play('showdown');

                        
                        // Tarea 41: Efecto Slow-Mo Cinematográfico
                        globalTimeScale = 0.3;
                        let tsInterval = setInterval(() => {
                            globalTimeScale += 0.05;
                            if (globalTimeScale >= 1.0) {
                                globalTimeScale = 1.0;
                                clearInterval(tsInterval);
                            }
                        }, 100);

                        MusicEngine.intensity = 1.6; // Más fuerte
                        // Tarea 9.2: Quitar showdown más rápido (1.5s)
                        setTimeout(() => overlay.classList.remove('active'), 1500);
                    }
                }
            }
            // Tarea 31: Sistema AFK
            if (isPlaying) {
                const idleTime = now - lastInputTime;
                if (idleTime > 20000) {
                    document.getElementById('afk-error').style.display = 'flex';
                    document.getElementById('afk-warning').style.display = 'none';
                    isPlaying = false;
                } else if (idleTime > 7000) {
                    document.getElementById('afk-warning').style.display = 'flex';
                } else {
                    document.getElementById('afk-warning').style.display = 'none';
                }
            }
            if (isPlaying && playerHP > 0) {
                // Tarea 10.1: Regeneración más lenta (3.5s delay, menor burst/drip)
                if (now - playerLastDamageTime > 3500) {
                    if (now - playerLastRegenBurstTime >= 3500) {
                        playerHP = Math.min(playerMaxHP, playerHP + 500);
                        playerLastRegenBurstTime = now;
                    }
                    playerHP = Math.min(playerMaxHP, playerHP + 0.8 * delta);
                    updateHPDisplay(playerGroup, playerHP, playerMaxHP, "Tú");
                }

                if (playerAmmo < MAX_AMMO) {
                    playerRechargeProgress += delta * (1000 / RECHARGE_TIME);
                    if (playerRechargeProgress >= 1) {
                        playerAmmo = Math.min(MAX_AMMO, playerAmmo + 1);
                        playerRechargeProgress = 0;
                        SoundEngine.play('recharge');
                    }
                } else {
                    playerRechargeProgress = 0;
                }
                updateAmmoDisplay(playerGroup, playerAmmo, MAX_AMMO, playerRechargeProgress, true);
            }

            for (const e of enemies) {
                if (e.dead) continue;

                // Tarea 10.1: Regeneración bots lenta
                if (now - e.lastDamageTime > 3500) {
                    if (now - e.lastRegenBurstTime >= 3500) {
                        e.hp = Math.min(e.maxHP, e.hp + 500);
                        e.lastRegenBurstTime = now;
                    }
                    e.hp = Math.min(e.maxHP, e.hp + 0.8 * delta);
                    updateHPDisplay(e.mesh, e.hp, e.maxHP, e.name);
                }

                // Tarea 31: Detección de bots atascados
                const distToLast = e.mesh.position.distanceTo(e.lastPos);
                if (distToLast < 0.1 && (e.state === 'PATROL' || e.state === 'CHASE')) {
                    e.stuckTimer += delta;
                    if (e.stuckTimer > 0.6) {
                        // Tarea 36/45: Detector de atascamiento más agresivo (0.6s)
                        // Nudge reactivo: Elegir dirección opuesta a la actual o aleatoria
                        const randomEscape = new THREE.Vector3((Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40);
                        e.patrolPoint.add(randomEscape);
                        e.stuckTimer = 0;
                    }
                } else {
                    e.stuckTimer = 0;
                }
                e.lastPos.copy(e.mesh.position);

                if (e.ammo < MAX_AMMO) {
                    e.rechargeProgress = (e.rechargeProgress || 0) + delta * (1000 / RECHARGE_TIME);
                    if (e.rechargeProgress >= 1) {
                        e.ammo = Math.min(MAX_AMMO, e.ammo + 1);
                        e.rechargeProgress = 0;
                    }
                } else {
                    e.rechargeProgress = 0;
                }
                updateAmmoDisplay(e.mesh, e.ammo, MAX_AMMO, e.rechargeProgress, false);
            }


            if (isPlaying) {
                const distanceToMove = moveSpeed * delta;

                let moveX = 0;
                let moveZ = 0;

                if (keys.w) moveZ -= 1;
                if (keys.s) moveZ += 1;
                if (keys.a) moveX -= 1;
                if (keys.d) moveX += 1;

                if (moveX !== 0 && moveZ !== 0) {
                    const factor = Math.sqrt(0.5);
                    moveX *= factor;
                    moveZ *= factor;
                }

                let nextX = playerGroup.position.x + moveX * distanceToMove;
                let nextZ = playerGroup.position.z + moveZ * distanceToMove;

                // Colisiones con paredes para el jugador
                const playerRadius = 0.7;
                const nextPlayerBoxX = new THREE.Box3(
                    new THREE.Vector3(nextX - playerRadius, 0, playerGroup.position.z - playerRadius),
                    new THREE.Vector3(nextX + playerRadius, 2, playerGroup.position.z + playerRadius)
                );
                const nextPlayerBoxZ = new THREE.Box3(
                    new THREE.Vector3(playerGroup.position.x - playerRadius, 0, nextZ - playerRadius),
                    new THREE.Vector3(playerGroup.position.x + playerRadius, 2, nextZ + playerRadius)
                );

                let collisionX = false;
                let collisionZ = false;

                for (let w of walls) {
                    if (!collisionX && w.box.intersectsBox(nextPlayerBoxX)) collisionX = true;
                    if (!collisionZ && w.box.intersectsBox(nextPlayerBoxZ)) collisionZ = true;
                }
                // Colisión con cajas
                for (let b of boxes) {
                    if (!collisionX && b.box.intersectsBox(nextPlayerBoxX)) collisionX = true;
                    if (!collisionZ && b.box.intersectsBox(nextPlayerBoxZ)) collisionZ = true;
                }

                if (!collisionX) playerGroup.position.x = nextX;
                if (!collisionZ) playerGroup.position.z = nextZ;

                // Limitar al jugador dentro del mapa
                const pLimit = (mapSize / 2) - 1;
                playerGroup.position.x = Math.max(-pLimit, Math.min(pLimit, playerGroup.position.x));
                playerGroup.position.z = Math.max(-pLimit, Math.min(pLimit, playerGroup.position.z));

                raycaster.setFromCamera(mouse, camera);
                const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
                const intersectPoint = new THREE.Vector3();
                raycaster.ray.intersectPlane(plane, intersectPoint);

                if (intersectPoint) {
                    const targetAngle = Math.atan2(intersectPoint.x - playerGroup.position.x, intersectPoint.z - playerGroup.position.z);
                    playerGroup.rotation.y = targetAngle;
                }

                for (let i = bullets.length - 1; i >= 0; i--) {
                    const bullet = bullets[i];

                    let removeBullet = false;

                    // Tarea 20: Distancia recorrida exacta de 3 metros
                    const step = bulletSpeed * delta;
                    bullet.traveled = (bullet.traveled || 0) + step;

                    if (bullet.traveled >= bulletRange) {
                        removeBullet = true;
                    } else {
                        bullet.mesh.position.addScaledVector(bullet.dir, step);

                        // Colisión con CAJAS (Tarea 37) - OPTIMIZADO con Distancia
                        for (let bIdx = boxes.length - 1; bIdx >= 0; bIdx--) {
                            const b = boxes[bIdx];
                            const distToBox = bullet.mesh.position.distanceTo(b.mesh.position);
                            if (distToBox < 1.5) { // Radio de colisión simple para caja
                                b.hp -= (bullet.damage || 200);
                                updateHPDisplay(b.mesh, b.hp, b.maxHp, "Caja");

                                b.mesh.material.emissive.setHex(0xff0000);
                                b.mesh.material.emissiveIntensity = 1.0;
                                b.hitTime = Date.now();

                                SoundEngine.play('hit');
                                removeBullet = true;

                                if (b.hp <= 0) {
                                    spawnPowerCube(b.mesh.position.clone());
                                    SoundEngine.play('powerup');

                                    scene.remove(b.mesh);
                                    boxes.splice(bIdx, 1);
                                }
                                break;
                            }
                        }

                        if (removeBullet) { // Si la bala colisionó con una caja, no seguir procesando
                            returnBulletToPool(bullet.mesh);
                            bullets.splice(i, 1);
                            continue; // Pasar a la siguiente bala
                        }

                        // Colisión con paredes
                        const bulletBox = new THREE.Box3().setFromObject(bullet.mesh);
                        for (let w of walls) {
                            if (w.box.intersectsBox(bulletBox)) {
                                removeBullet = true;
                                break;
                            }
                        }
                    }

                    if (removeBullet) {
                        returnBulletToPool(bullet.mesh);
                        bullets.splice(i, 1);
                    }
                }

                // 8.1. Lógica de Sigilo y Visibilidad (Tarea FIX STEALTH)
                let inGrass = false;
                _box.setFromCenterAndSize(playerGroup.position, _v1.set(1, 1, 1));
                for (let j = 0; j < grassBlocks.length; j++) {
                    if (grassBlocks[j].box.intersectsBox(_box)) {
                        inGrass = true;
                        break;
                    }
                }

                // Tarea 9.4: Revelarse si dispara (0.7s - Más dinámico)
                const shootingReveal = (Date.now() - playerLastShot < 700);

                // Tarea 9.4: Revelación por proximidad mutua (Radio reducido a 2.5m -> 6.25 sq)
                let nearEnemy = false;
                for (let j = 0; j < enemies.length; j++) {
                    const e = enemies[j];
                    if (e.dead) continue;
                    if (playerGroup.position.distanceToSquared(e.mesh.position) < 6.25) {
                        nearEnemy = true;
                        break;
                    }
                }

                playerVisible = !inGrass || shootingReveal || nearEnemy;

                // Opacidad según visibilidad (Tarea 9.4: Transparente para uno mismo, invisible para otros)
                for (let j = 0; j < playerGroup.children.length; j++) {
                    const c = playerGroup.children[j];
                    if (!c.material) continue;
                    // El jugador siempre se ve transparente a sí mismo si está oculto
                    c.material.opacity = playerVisible ? 1.0 : 0.4; 
                    c.material.depthWrite = true; // Mantener profundidad para no verse raro
                }
                for (let i = enemies.length - 1; i >= 0; i--) {
                    const enemy = enemies[i];
                    if (enemy.dead) continue; // Saltar bots muertos pendientes de splice

                    // --- IA DE DECISIONES (Tarea 7.3: Optimized) ---
                    let bestTarget = null;
                    let bestScore = -Infinity;

                    // 1. Evaluar Jugador como objetivo
                    _v1.copy(playerGroup.position);
                    let distSq = enemy.mesh.position.distanceToSquared(_v1);
                    if (distSq < 900) { // 30m radio
                        _v2.copy(enemy.mesh.position).setY(1);
                        _v3.copy(playerGroup.position).setY(1);
                        _dirTemp.subVectors(_v3, _v2).normalize();
                        _raycaster.set(_v2, _dirTemp);
                        _raycaster.far = Math.sqrt(distSq);
                        
                        let loS = true;
                        for (let w of walls) {
                            if (_raycaster.intersectObject(w.mesh).length > 0) {
                                loS = false;
                                break;
                            }
                        }

                        // Tarea 9.4: Bots invisibles en pasto + Detección jugador oculta
                        if (loS && (playerVisible || distSq < 6.25)) {
                            let score = (30 - Math.sqrt(distSq));
                            if (enemy.lastAttacker === 'Tú') score += 15;
                            if (enemy.target && enemy.target.name === 'Tú') score += 5;
                            bestScore = score;
                            bestTarget = { mesh: playerGroup, name: 'Tú', isPlayer: true };
                        }
                    }

                    // 2. Evaluar otros Bots
                    for (let j = 0; j < enemies.length; j++) {
                        const other = enemies[j];
                        if (other === enemy || other.dead) continue;
                        
                        distSq = enemy.mesh.position.distanceToSquared(other.mesh.position);
                        if (distSq < 900) {
                            _v2.copy(enemy.mesh.position).setY(1);
                            _v3.copy(other.mesh.position).setY(1);
                            _dirTemp.subVectors(_v3, _v2).normalize();
                            _raycaster.set(_v2, _dirTemp);
                            _raycaster.far = Math.sqrt(distSq);

                            let loS = true;
                            for (let w of walls) {
                                if (_raycaster.intersectObject(w.mesh).length > 0) {
                                    loS = false;
                                    break;
                                }
                            }

                            // Tarea 9.4: Invisibilidad bots entre sí
                            if (loS && (other.isVisible || distSq < 6.25)) {
                                let score = (30 - Math.sqrt(distSq));
                                if (enemy.lastAttacker === other.name) score += 15;
                                if (enemy.target && enemy.target.name === other.name) score += 5;

                                if (score > bestScore) {
                                    bestScore = score;
                                    bestTarget = { mesh: other.mesh, name: other.name, isPlayer: false };
                                }
                            }
                        }
                    }

                    // Tarea 15.2: Evaluar Cubos de Poder (Prioridad alta si están cerca)
                    for (let j = 0; j < powerCubes.length; j++) {
                        const cube = powerCubes[j];
                        distSq = enemy.mesh.position.distanceToSquared(cube.mesh.position);
                        if (distSq < 400) { // 20 metros
                            let score = (25 - Math.sqrt(distSq));
                            if (score > bestScore) {
                                bestScore = score;
                                bestTarget = { mesh: cube.mesh, name: "Cubo", isCube: true };
                            }
                        }
                    }

                    // Tarea 15.2: Evaluar Cajas (Si no hay enemigos o cubos mejores)
                    if (!bestTarget || bestScore < 10) {
                        for (let j = 0; j < boxes.length; j++) {
                            const box = boxes[j];
                            distSq = enemy.mesh.position.distanceToSquared(box.mesh.position);
                            if (distSq < 225) { // 15 metros
                                let score = (15 - Math.sqrt(distSq));
                                if (score > bestScore) {
                                    bestScore = score;
                                    bestTarget = { mesh: box.mesh, name: "Caja", isBox: true };
                                }
                            }
                        }
                    }

                    if (enemy.hp < enemy.maxHP * 0.35) {
                        enemy.state = 'FLEE';
                    } else if (bestTarget) {
                        enemy.target = bestTarget;
                        const d = enemy.mesh.position.distanceTo(bestTarget.mesh.position);
                        const aggro = enemy.aggression || 0.5;
                        
                        if (bestTarget.isCube) {
                            enemy.state = 'CHASE'; // Ir a por el cubo
                        } else if (bestTarget.isBox) {
                            let range = 6;
                            if (d < range) enemy.state = 'ATTACK';
                            else enemy.state = 'CHASE';
                        } else {
                            // Objetivo Brawler
                            let baseRange = (enemy.attackRange || 8) * (enemy.hp > enemy.maxHP * 0.7 ? (1 - aggro * 0.4) : 1);
                            if (d < baseRange) enemy.state = 'ATTACK';
                            else enemy.state = 'CHASE';
                        }
                    } else {
                        enemy.target = null;
                        if (Date.now() - enemy.lastDecision > (2000 + Math.random() * 2000)) {
                            enemy.state = 'PATROL';
                            enemy.lastDecision = Date.now();
                        }
                    }

                    // Detección de bala cercana para esquive
                    let bulletToDodge = null;
                    for (let b of bullets) {
                        if (b.owner === enemy.name) continue;
                        if (enemy.mesh.position.distanceTo(b.mesh.position) < 5) {
                            bulletToDodge = b;
                            break;
                        }
                    }

                    // --- MOVIMIENTO SEGÚN ESTADO ---
                    const botMapLimit = (mapSize / 2) - 1.5;

                    if (enemy.state === 'FLEE') {
                        // Huir del objetivo o perseguidor
                        let threat = enemy.target ? enemy.target.mesh : playerGroup;
                        const fleeDir = new THREE.Vector3().subVectors(enemy.mesh.position, threat.position).normalize();
                        moveCharacter(enemy, fleeDir, enemy.speed * 1.3 * delta);
                        // Mirar hacia donde huye
                        enemy.mesh.lookAt(enemy.mesh.position.x + fleeDir.x, enemy.mesh.position.y, enemy.mesh.position.z + fleeDir.z);

                        // Tarea AI: Kiting mientras huye
                        if (enemy.ammo >= 1 && Date.now() - enemy.lastShot > 1600 && enemy.target) {
                            enemy.lastShot = Date.now();
                            const shootDir = new THREE.Vector3().subVectors(enemy.target.mesh.position, enemy.mesh.position).normalize();
                            fireSpread(enemy.mesh.position, shootDir, 'enemy', enemy.name);
                            enemy.ammo--;
                        }

                    } else if (enemy.state === 'CHASE' || enemy.state === 'ATTACK') {
                        const targetMesh = enemy.target.mesh;
                        const dist = enemy.mesh.position.distanceTo(targetMesh.position);
                        const dir = new THREE.Vector3().subVectors(targetMesh.position, enemy.mesh.position).normalize();

                        if (enemy.state === 'CHASE') {
                            moveCharacter(enemy, dir, enemy.speed * delta);
                        } else {
                            // Tarea AI: Movimiento COMBINADO (Strafe + Acercarse/Alejarse)
                            const strafeDir = new THREE.Vector3(-dir.z, 0, dir.x);
                            const t = Date.now() * 0.002;
                            // Variedad en el strafe según el bot
                            const strafeFreq = 0.5 + (i % 3) * 0.2;
                            const strafeFactor = Math.sin(t * strafeFreq + i) * (enemy.speed * 0.8);

                            let thrustFactor = 0;
                            const aggro = enemy.aggression || 0.5;
                            if (enemy.hp > enemy.maxHP * 0.5) {
                                thrustFactor = enemy.speed * aggro; // Más aggro -> más rápido se acerca
                            } else if (dist < 6) {
                                thrustFactor = -enemy.speed * (1.1 - aggro); // Menos aggro -> más rápido huye
                            }

                            const combinedMove = new THREE.Vector3()
                                .addScaledVector(strafeDir, strafeFactor)
                                .addScaledVector(dir, thrustFactor);

                            moveCharacter(enemy, combinedMove.normalize(), enemy.speed * delta);
                        }

                        // Tarea AI: Apuntado PREDICTIVO
                        let aimPos = targetMesh.position.clone();
                        if (enemy.target.isPlayer) {
                            const playerVel = new THREE.Vector3().subVectors(playerGroup.position, playerLastPos).divideScalar(delta || 0.016);
                            aimPos.addScaledVector(playerVel, 0.25); // Un pelín más de predicción
                        } else {
                            const targetBot = enemies.find(eb => eb.name === enemy.target.name);
                            if (targetBot) {
                                const botVel = new THREE.Vector3().subVectors(targetBot.mesh.position, targetBot.lastPos).divideScalar(delta || 0.016);
                                aimPos.addScaledVector(botVel, 0.25);
                            }
                        }
                        // Mirar al objetivo sin inclinar
                        enemy.mesh.lookAt(aimPos.x, enemy.mesh.position.y, aimPos.z);

                        if (enemy.state === 'ATTACK' && enemy.ammo >= 1 && Date.now() - enemy.lastShot > 1400) {
                            enemy.lastShot = Date.now();
                            // Recalcular shootDir justo antes de disparar para máxima precisión
                            const shootDir = new THREE.Vector3().subVectors(aimPos, enemy.mesh.position).normalize();
                            fireSpread(enemy.mesh.position, shootDir, 'enemy', enemy.name);
                            enemy.ammo = Math.max(0, enemy.ammo - 1);
                            updateAmmoDisplay(enemy.mesh, enemy.ammo, MAX_AMMO, enemy.rechargeProgress);
                        }
                    } else if (enemy.state === 'PATROL') {
                        const dp = enemy.mesh.position.distanceTo(enemy.patrolPoint);
                        if (dp > 2.0) {
                            const dir = new THREE.Vector3().subVectors(enemy.patrolPoint, enemy.mesh.position).normalize();
                            moveCharacter(enemy, dir, (enemy.speed * 0.7) * delta);
                            enemy.mesh.lookAt(enemy.patrolPoint.x, 0, enemy.patrolPoint.z);
                        } else {
                            // Llegó al punto: Escanear área (girar) y elegir nuevo destino
                            const scanAngle = Math.sin(Date.now() * 0.003) * 0.5;
                            enemy.mesh.rotation.y += scanAngle * 0.1;

                            if (Date.now() - enemy.lastDecision > 2000) {
                                enemy.lastDecision = Date.now();
                                // Tarea 29: 40% de ir al centro para buscar pelea
                                if (Math.random() < 0.4) {
                                    enemy.patrolPoint.set((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10);
                                } else {
                                    enemy.patrolPoint.set((Math.random() - 0.5) * 80, 0, (Math.random() - 0.5) * 80);
                                }
                            }
                        }
                    }

                    // ESQUIVE de bala (limitado para no salir del mapa)
                    if (bulletToDodge && enemy.state !== 'FLEE') {
                        const dodgeDir = new THREE.Vector3(-bulletToDodge.dir.z, 0, bulletToDodge.dir.x);
                        moveCharacter(enemy, dodgeDir, enemy.speed * delta);
                    }


                    // Limitar bots dentro del mapa (Eliminamos duplicidad de push que causaba "volar")
                    enemy.mesh.position.x = Math.max(-botMapLimit, Math.min(botMapLimit, enemy.mesh.position.x));
                    enemy.mesh.position.z = Math.max(-botMapLimit, Math.min(botMapLimit, enemy.mesh.position.z));

                    // 8.2. Sigilo para los Bots (Visual) - Tarea FIX STEALTH
                    let botInGrass = false;
                    const botFeetBox = new THREE.Box3().setFromCenterAndSize(
                        enemy.mesh.position,
                        new THREE.Vector3(1, 1, 1)
                    );
                    for (let g of grassBlocks) {
                        if (g.box.intersectsBox(botFeetBox)) {
                            botInGrass = true;
                            break;
                        }
                    }
                    const botShootingReveal = (Date.now() - enemy.lastShot < 700);
                    const nearPlayer = (enemy.mesh.position.distanceToSquared(playerGroup.position) < 6.25);
                    enemy.isVisible = !botInGrass || botShootingReveal || nearPlayer;

                    enemy.mesh.traverse(c => {
                        if (c.material) {
                            c.material.opacity = enemy.isVisible ? 1.0 : 0.0;
                            c.material.depthWrite = enemy.isVisible;
                        }
                    });

                    // Sistema de Daño para Bots (OPTIMIZADO con Distancia)
                    for (let j = bullets.length - 1; j >= 0; j--) {
                        const bullet = bullets[j];
                        if (bullet.owner === enemy.name) continue;

                        const distToEnemy = bullet.mesh.position.distanceTo(enemy.mesh.position);
                        if (distToEnemy < 1.2) {
                            enemy.hp -= (bullet.damage || 200);
                            enemy.lastDamageTime = Date.now();
                            enemy.lastRegenBurstTime = Date.now();
                            updateHPDisplay(enemy.mesh, enemy.hp, enemy.maxHP, enemy.name);
                            SoundEngine.play('hit');

                            if (enemy.mesh.userData.bodyMaterial) {
                                enemy.mesh.userData.bodyMaterial.emissive.setHex(0xff0000);
                                enemy.mesh.userData.bodyMaterial.emissiveIntensity = 0.8;
                            }
                            enemy.hitTime = Date.now();
                            enemy.originalPos.copy(enemy.mesh.position);
                            enemy.lastAttacker = bullet.owner || (bullet.type === 'player' ? 'Tú' : null);

                            if (enemy.hp <= 0 && !enemy.dead) {
                                spawnPowerCube(enemy.mesh.position.clone());
                            }

                            returnBulletToPool(bullet.mesh);
                            bullets.splice(j, 1);
                            if (enemy.hp <= 0) {
                                // Kill Feed Entry
                                const killerName = bullet.type === 'player' ? 'Tú' : (bullet.owner || 'Bot');
                                addKillEntry(killerName, enemy.name);
                                SoundEngine.play('death');

                                enemy.dead = true; 
                                scene.remove(enemy.mesh);
                                enemies.splice(i, 1);
                                updateSurvivorCount();
                                break;
                            }
                        }
                    }
                }

                // Actualizar animaciones (Tarea 20) - FUERA del bucle de bots para evitar redundancia O(N^2)
                const animNow = Date.now() * 0.001;

                // Jugador
                if (isPlaying && playerGroup) {
                    let pState = 'idle';
                    const pMoveDist = Math.sqrt(moveX * moveX + moveZ * moveZ);
                    if (pMoveDist > 0.01) pState = 'walk';
                    if (Date.now() - playerLastShot < 200) pState = 'attack';
                    updateCharacterAnimation(playerGroup, pState, animNow, delta);
                }

                // Bots
                enemies.forEach(eb => {
                    if (eb.dead) return;
                    let eState = 'idle';
                    if (eb.target || (eb.state === 'CHASE' || eb.state === 'ATTACK')) eState = 'walk'; 
                    if (Date.now() - eb.lastShot < 200) eState = 'attack';
                    updateCharacterAnimation(eb.mesh, eState, animNow, delta);
                });

                // Checkear si las balas enemigas nos dan a nosotros (OPTIMIZADO + FIX REMOVAL)
                for (let j = bullets.length - 1; j >= 0; j--) {
                    const bullet = bullets[j];
                    if (bullet.type === 'player') continue;

                    const distToPlayer = bullet.mesh.position.distanceTo(playerGroup.position);
                    if (distToPlayer < 1.2) { // Tarea 8.1: Aumentado radio para recibir daño correctamente
                        playerHP -= (bullet.damage || 200);
                        playerLastDamageTime = Date.now();
                        playerLastRegenBurstTime = Date.now();
                        updateHPDisplay(playerGroup, playerHP, playerMaxHP, "Tú");
                        SoundEngine.play('hit');

                        if (playerGroup.userData.bodyMaterial) {
                            playerGroup.userData.bodyMaterial.emissive.setHex(0xff0000);
                            playerGroup.userData.bodyMaterial.emissiveIntensity = 0.8;
                        }
                        playerHitTime = Date.now();
                        playerOriginalPos.copy(playerGroup.position);

                        // FIX: Eliminar bala al impactar al jugador
                        returnBulletToPool(bullet.mesh);
                        bullets.splice(j, 1);

                        if (playerHP < 0) playerHP = 0;

                        if (playerHP <= 0 && isPlaying) {
                            isPlaying = false;
                            gameOver = true;
                            
                            // Tarea 17.1: Desaparición instantánea
                            scene.remove(playerGroup);
                            
                            // Kill feed entry para nosotros
                            const killerName = bullet.owner || 'Bot';
                            addKillEntry(killerName, 'Tú');

                            // Tarea 17.2: Delay de 2 segundos con difuminado si no es top 2
                            const currentEnemies = enemies.length;
                            const finishPlace = currentEnemies + 1;

                            if (finishPlace > 2) {
                                // Aplicar desenfoque al contenedor del juego
                                const gameContainer = document.getElementById('game-container');
                                gameContainer.style.filter = 'blur(10px)';
                                gameContainer.style.transition = 'filter 2s ease';
                                
                                setTimeout(() => {
                                    showLossMenu();
                                }, 2000);
                            } else {
                                // Victoria o Top 2 (comportamiento anterior simplificado)
                                MusicEngine.stop();
                                despawnWorld();
                                gameStats.style.display = 'none';
                                startMenu.style.display = 'flex';
                                const header = document.querySelector('#start-menu h1');
                                header.style.display = 'block';
                                header.innerText = (finishPlace === 1 ? "¡VICTORIA!" : "¡Top 2!");
                                startBtn.innerText = "Jugar de nuevo";
                                uiContainer.style.display = 'none';
                            }
                        }
                    }
                }

                if (isPlaying && enemies.length === 0 && Date.now() - gameStartTime > 3000) {
                    isPlaying = false;
                    despawnWorld();
                    gameStats.style.display = 'none';
                    startMenu.style.display = 'flex';
                    document.querySelector('#start-menu h1').innerText = "¡VICTORIA!";
                    startBtn.innerText = "Jugar de nuevo";
                    uiContainer.style.display = 'none';
                }
            }

            if (!isPlaying) {
                const time = Date.now() * 0.0005;
                camera.position.x = Math.sin(time) * 30;
                camera.position.z = Math.cos(time) * 30;
                camera.position.y = 20;
                camera.lookAt(0, 0, 0);
            } else if (playerGroup) {
                // Actualizar Cámara (perseguir al jugador suavemente, lerp) en partida
                const targetCameraPos = new THREE.Vector3(
                    playerGroup.position.x + cameraOffset.x,
                    playerGroup.position.y + cameraOffset.y,
                    playerGroup.position.z + cameraOffset.z
                );

                // Tarea 34: Aplicar sacudida de pantalla (Screen Shake)
                if (screenShake > 0) {
                    targetCameraPos.x += (Math.random() - 0.5) * screenShake;
                    targetCameraPos.z += (Math.random() - 0.5) * screenShake * 0.5;
                    targetCameraPos.y += (Math.random() - 0.5) * screenShake * 0.2;
                }

                // Tarea 10.3: Cámara más firme (Lerp 0.2) para reducir vibración visual en UI
                camera.position.lerp(targetCameraPos, 0.2);
                camera.lookAt(playerGroup.position);
            }

            // Billboarding de compensación (Tarea 12.1): Ignorar rotación del padre
            const billboardTargets = [playerGroup, ...enemies.map(e => e.mesh)];
            billboardTargets.forEach(t => {
                if (!t) return;
                
                _qTemp.copy(t.getWorldQuaternion(_qTemp2)).invert(); // Cancelar rotación del mundo del brawler
                
                const hp = t.getObjectByName('hpDisplay');
                if (hp) {
                    hp.quaternion.copy(_qTemp).multiply(camera.quaternion);
                }
                
                const ammo = t.getObjectByName('ammoDisplay');
                if (ammo) {
                    ammo.quaternion.copy(_qTemp).multiply(camera.quaternion);
                }
            });
            
            // Tarea 37.1: Manejar efectos de Hit en cajas (Flash y Shake Intenso)
            boxes.forEach(b => {
                if (b.hitTime > 0) {
                    const elapsed = now - b.hitTime;
                    if (elapsed < 120) {
                        // Sacudida aleatoria intensa (Tarea 37.1 intensificada)
                        const shakeAmt = 0.4;
                        b.mesh.position.x = b.originalPos.x + (Math.random() - 0.5) * shakeAmt;
                        b.mesh.position.z = b.originalPos.z + (Math.random() - 0.5) * shakeAmt;
                        b.mesh.material.emissiveIntensity = 1.0 - (elapsed / 120);
                    } else {
                        // Restaurar
                        b.mesh.material.emissive.setHex(0x000000);
                        b.mesh.position.copy(b.originalPos);
                        b.hitTime = 0;
                    }
                }
            });

            // Tarea 38: Manejar efectos de Hit en Brawlers (Flash y Shake Visual)
            enemies.concat(playerGroup ? [{ mesh: playerGroup, hitTime: playerHitTime, isPlayer: true, originalPos: playerOriginalPos }] : []).forEach(e => {
                const targetHitTime = e.isPlayer ? playerHitTime : e.hitTime;
                const visual = e.mesh.getObjectByName("visualGroup");

                if (targetHitTime > 0) {
                    const elapsed = now - targetHitTime;
                    if (elapsed < 150) {
                        // Shake lateral SOLO VISUAL
                        if (visual) {
                            visual.position.x = (Math.random() - 0.5) * 0.4;
                        }
                        // El material flash se maneja por userData
                        if (e.mesh.userData.bodyMaterial) {
                            e.mesh.userData.bodyMaterial.emissiveIntensity = 0.8 * (1 - (elapsed / 150));
                        }
                    } else {
                        // Restaurar
                        if (visual) visual.position.x = 0;
                        if (e.mesh.userData.bodyMaterial) {
                            e.mesh.userData.bodyMaterial.emissive.setHex(0x000000);
                        }
                        if (e.isPlayer) playerHitTime = 0;
                        else e.hitTime = 0;
                    }
                }
            });

            // Tarea 37: Lógica de ítems (cubos de poder)
            for (let i = powerCubes.length - 1; i >= 0; i--) {
                const cube = powerCubes[i];
                cube.mesh.rotation.y += delta * 2; // Giro 360
                cube.mesh.position.y = 1 + Math.sin(now * 0.005) * 0.2; // Flotación

                // Recogida por el Jugador
                if (playerGroup && playerGroup.position.distanceTo(cube.mesh.position) < 1.5) {
                    playerMaxHP += 700;
                    playerHP += 700;
                    playerDamageMultiplier += 0.08;
                    updateHPDisplay(playerGroup, playerHP, playerMaxHP, "Tú");

                    // Tarea 9.3: No cambiar el color/brillo de la skin al recoger
                    /* 
                    if (playerGroup.userData.bodyMaterial) {
                        playerGroup.userData.bodyMaterial.emissive.setHex(0xFFFFFF);
                        playerGroup.userData.bodyMaterial.emissiveIntensity = 2.0;
                    }
                    */
                    // playerGroup.scale.set(1.4, 1.4, 1.4); // Eliminado

                    // Tarea 42: Partículas de recolección (Efecto Burst)
                    for (let p_i = 0; p_i < 8; p_i++) {
                        const pGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
                        const pMat = new THREE.MeshBasicMaterial({ color: 0x00FF88 });
                        const pPart = new THREE.Mesh(pGeo, pMat);
                        pPart.position.copy(cube.mesh.position);
                        scene.add(pPart);
                        
                        const pDir = new THREE.Vector3(
                            (Math.random() - 0.5) * 2,
                            Math.random() * 2,
                            (Math.random() - 0.5) * 2
                        ).normalize();
                        
                        let pLife = 0;
                        const pAnimate = () => {
                            pLife += 0.05;
                            pPart.position.addScaledVector(pDir, 0.1);
                            pPart.scale.multiplyScalar(0.9);
                            if (pLife < 1) requestAnimationFrame(pAnimate);
                            else {
                                scene.remove(pPart);
                                pGeo.dispose();
                                pMat.dispose();
                            }
                        };
                        pAnimate();
                    }

                    scene.remove(cube.mesh);
                    powerCubes.splice(i, 1);
                    SoundEngine.play('recharge');
                    SoundEngine.play('powerup');
                    continue;
                }

                // Recogida por Bots (opcional pero justo)
                for (const e of enemies) {
                    if (!e.dead && e.mesh.position.distanceTo(cube.mesh.position) < 1.5) {
                        e.maxHP += 700;
                        e.hp += 700;
                        e.damageMultiplier += 0.08;
                        updateHPDisplay(e.mesh, e.hp, e.maxHP, e.name);

                        scene.remove(cube.mesh);
                        powerCubes.splice(i, 1);
                        break;
                    }
                }
            }

            renderer.render(scene, camera);

            // Tarea FIX AI: Actualizar última posición del jugador para velocidad
            if (playerGroup) playerLastPos.copy(playerGroup.position);
        }

        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });

        // ¡Iniciar juego!
        animate();

    

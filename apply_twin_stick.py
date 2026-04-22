import os

path = r"c:\Users\User\Desktop\BrawlClone3D\index.html"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Add aimIndicator globally
old_globals = """        let isPlaying = false;
        let gameOver = false;
        let playerGroup = null;
        let playerHP = MAX_HP;"""
new_globals = """        let isPlaying = false;
        let gameOver = false;
        let playerGroup = null;
        let aimIndicator = null;
        let playerHP = MAX_HP;"""
text = text.replace(old_globals.replace("\r", ""), new_globals)

# 2. Add aimIndicator inside spawnPlayerAt
old_spawn = """        function spawnPlayerAt(x, z) {
            if (playerGroup) scene.remove(playerGroup);
            playerGroup = createDetailedBrawler(0x00FF88);
            playerGroup.position.set(x, 0, z);
            playerGroup.name = "Jugador"; // Store name for easier access
            scene.add(playerGroup);"""
new_spawn = """        function spawnPlayerAt(x, z) {
            if (playerGroup) scene.remove(playerGroup);
            playerGroup = createDetailedBrawler(0x00FF88);
            playerGroup.position.set(x, 0, z);
            playerGroup.name = "Jugador"; // Store name for easier access
            
            // Aim indicator
            const aimGeom = new THREE.BoxGeometry(0.3, 0.1, 15);
            aimGeom.translate(0, 0, 7.5);
            const aimMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
            aimIndicator = new THREE.Mesh(aimGeom, aimMat);
            aimIndicator.position.y = 1.0;
            aimIndicator.visible = false;
            playerGroup.add(aimIndicator);

            scene.add(playerGroup);"""
text = text.replace(old_spawn.replace("\r", ""), new_spawn)

# 3. Refactor mousedown into playerShoot
old_mouse = """        window.addEventListener('mousedown', (e) => {
            console.log("LOG: Game Mousedown", { isPlaying, introSequenceActive, button: e.button, playerHP });
            if (e.button !== 0 || !isPlaying || playerHP <= 0 || introSequenceActive) return;

            if (playerAmmo < 1) {
                console.log("LOG: Out of Ammo");
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
                SoundEngine.play('shoot', playerGroup.position);

                playerAmmo = Math.max(0, playerAmmo - 1);
                updateAmmoDisplay(playerGroup, playerAmmo, MAX_AMMO, playerRechargeProgress, true);
            }
        });"""

new_mouse = """        function playerShoot(direction) {
            if (!isPlaying || playerHP <= 0 || introSequenceActive) return;

            if (playerAmmo < 1) {
                SoundEngine.play('empty');
                screenShake = 0.2; 
                const ammoUI = playerGroup.getObjectByName('ammoDisplay');
                if (ammoUI) {
                    const targetX = 0; 
                    const startTime = Date.now();
                    const shake = () => {
                        const elapsed = Date.now() - startTime;
                        if (elapsed < 200) {
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

            playerLastShot = Date.now();
            direction.y = 0;
            direction.normalize();
            
            playerGroup.lookAt(playerGroup.position.clone().add(direction));

            fireSpread(playerGroup.position, direction, 'player', 'Tú');
            SoundEngine.play('shoot', playerGroup.position);

            playerAmmo = Math.max(0, playerAmmo - 1);
            updateAmmoDisplay(playerGroup, playerAmmo, MAX_AMMO, playerRechargeProgress, true);
        }

        window.addEventListener('mousedown', (e) => {
            if (e.button !== 0 || !isPlaying || playerHP <= 0 || introSequenceActive) return;

            raycaster.setFromCamera(mouse, camera);
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            const intersectPoint = new THREE.Vector3();
            raycaster.ray.intersectPlane(plane, intersectPoint);

            if (intersectPoint) {
                const direction = new THREE.Vector3().subVectors(intersectPoint, playerGroup.position);
                playerShoot(direction);
            }
        });"""
text = text.replace(old_mouse.replace("\r", ""), new_mouse)

# 4. Replace the old fire button with new aim joystick in HTML, and also update the aim Javascript Logic
old_fire_btn = """    <button id="fire-btn-mobile" style="position:fixed;bottom:60px;right:60px;width:120px;height:120px;background:#ff4444;border:4px solid #fff;border-radius:50%;z-index:9999;display:none;cursor:pointer;color:#fff;font-size:1.8rem;font-weight:bold;pointer-events:auto;touch-action:none;user-select:none;">FIRE</button>"""
new_aim_joystick = """    <div id="aim-base" style="position:fixed;bottom:60px;right:60px;width:150px;height:150px;background:rgba(255,68,68,0.2);border:4px solid rgba(255,68,68,0.6);border-radius:50%;display:none;z-index:9999;pointer-events:auto;touch-action:none;user-select:none;">
        <div id="aim-stick" style="position:absolute;width:70px;height:70px;background:#ff4444;border-radius:50%;left:50%;top:50%;margin-left:-35px;margin-top:-35px;box-shadow:0 0 15px rgba(255,68,68,0.8);pointer-events:none;transform:translate(0px, 0px);"></div>
    </div>"""
text = text.replace(old_fire_btn.replace("\r", ""), new_aim_joystick)

# Remove the old mobile fire button listener
old_fire_listener = """        // Fire button
        function onFire(e) {
            e.preventDefault();
            if (isPlaying && !introSequenceActive && playerHP > 0) {
                shoot();
            }
        }
        fireBtnMobile.addEventListener('mousedown', onFire);
        fireBtnMobile.addEventListener('touchstart', onFire, {passive: false});"""

new_aim_js = """        // === AIM JOYSTICK ==============================
        var aimBase = document.getElementById('aim-base');
        var aimStick = document.getElementById('aim-stick');
        
        var isAimActive = false;
        var aX = 0;
        var aY = 0;
        var aimDir = new THREE.Vector3();
        
        function onAimStart(e) {
            if (!isPlaying || playerHP <= 0 || introSequenceActive) return;
            isAimActive = true;
            var clientX = e.touches ? e.touches[0].clientX : e.clientX;
            var clientY = e.touches ? e.touches[0].clientY : e.clientY;
            if (aimIndicator) aimIndicator.visible = true;
            moveAimStick(clientX, clientY);
        }
        
        function onAimMove(e) {
            if (!isAimActive) return;
            var clientX = e.touches ? e.touches[0].clientX : e.clientX;
            var clientY = e.touches ? e.touches[0].clientY : e.clientY;
            moveAimStick(clientX, clientY);
        }
        
        function onAimEnd(e) {
            if (!isAimActive) return;
            isAimActive = false;
            
            if (Math.abs(aX) > 0.1 || Math.abs(aY) > 0.1) {
                aimDir.set(aX, 0, aY).normalize();
                if (typeof playerShoot === 'function') playerShoot(aimDir);
            }
            
            aX = 0;
            aY = 0;
            aimStick.style.transform = 'translate(0px, 0px)';
            if (aimIndicator) aimIndicator.visible = false;
        }

        aimBase.addEventListener('mousedown', onAimStart);
        document.addEventListener('mousemove', onAimMove);
        document.addEventListener('mouseup', onAimEnd);
        
        aimBase.addEventListener('touchstart', function(e) { e.preventDefault(); onAimStart(e); }, {passive: false});
        document.addEventListener('touchmove', function(e) { if(isAimActive) e.preventDefault(); onAimMove(e); }, {passive: false});
        document.addEventListener('touchend', onAimEnd);
        
        function moveAimStick(mx, my) {
            var baseRect = aimBase.getBoundingClientRect();
            var cx = baseRect.left + baseRect.width / 2;
            var cy = baseRect.top + baseRect.height / 2;
            
            var dx = mx - cx;
            var dy = my - cy;
            
            var dist = Math.sqrt(dx*dx + dy*dy);
            var maxD = (baseRect.width / 2) - 35;
            
            if (dist > maxD) {
                dx = dx / dist * maxD;
                dy = dy / dist * maxD;
            }
            
            aimStick.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
            
            aX = dx / maxD;
            aY = dy / maxD;
            
            if (aimIndicator && (Math.abs(aX) > 0.1 || Math.abs(aY) > 0.1)) {
                var angle = Math.atan2(aX, aY);
                aimIndicator.rotation.y = angle;
                playerGroup.rotation.y = angle;
            }
        }"""
text = text.replace(old_fire_listener.replace("\r", ""), new_aim_js)

# Updating visibility toggles in runIntroSequence and despawnWorld
text = text.replace("fireBtnMobile", "aimBase")

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

print("Done")

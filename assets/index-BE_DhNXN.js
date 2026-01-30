(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const m of a.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&s(m)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();const $={GAME:"lyers_game_state",CONFIG:"lyers_game_config"};function V(r){try{return localStorage.setItem($.GAME,JSON.stringify(r)),!0}catch(e){return console.error("Erreur lors de la sauvegarde:",e),!1}}function k(){try{const r=localStorage.getItem($.GAME);return r?JSON.parse(r):null}catch(r){return console.error("Erreur lors du chargement:",r),null}}function B(){try{return localStorage.removeItem($.GAME),!0}catch(r){return console.error("Erreur lors de la suppression:",r),!1}}function F(r){try{return localStorage.setItem($.CONFIG,JSON.stringify(r)),!0}catch(e){return console.error("Erreur lors de la sauvegarde de la config:",e),!1}}function H(){try{const r=localStorage.getItem($.CONFIG);return r?JSON.parse(r):null}catch(r){return console.error("Erreur lors du chargement de la config:",r),null}}class Q{constructor(){this.reset(),this.listeners=new Set}reset(){this.players=[],this.currentQuestion=null,this.answers=[],this.roles={},this.votes={},this.bets={},this.sniperGuess=null,this.phase="home",this.currentPlayerIndex=0,this.round=0,this.totalRounds=5,this.enabledRoles=["innocent"],this.timerDuration=120,this.sipMode=!1}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}notify(){this.listeners.forEach(e=>e(this))}update(e){Object.assign(this,e),this.notify(),this.persist()}persist(){V({players:this.players,currentQuestion:this.currentQuestion,answers:this.answers,roles:this.roles,votes:this.votes,bets:this.bets,sniperGuess:this.sniperGuess,phase:this.phase,currentPlayerIndex:this.currentPlayerIndex,round:this.round,totalRounds:this.totalRounds,enabledRoles:this.enabledRoles,timerDuration:this.timerDuration,sipMode:this.sipMode})}load(){const e=k();return e?(Object.assign(this,e),!0):!1}hasActiveGame(){const e=k();return e&&e.phase!=="home"&&e.players.length>0}clear(){B(),this.reset(),this.notify()}addPlayer(e){const t=`player_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;this.players.push({id:t,name:e,score:0}),this.notify()}removePlayer(e){this.players=this.players.filter(t=>t.id!==e),this.notify()}updatePlayerName(e,t){const s=this.players.find(n=>n.id===e);s&&(s.name=t,this.notify())}getCurrentPlayer(){return this.players[this.currentPlayerIndex]}nextPlayer(){return this.currentPlayerIndex++,this.currentPlayerIndex>=this.players.length?(this.currentPlayerIndex=0,!1):(this.notify(),!0)}setQuestion(e){this.currentQuestion=e,this.notify()}addAnswer(e,t){const s=this.answers.findIndex(n=>n.playerId===e);s>=0?this.answers[s].text=t:this.answers.push({id:`answer_${Date.now()}`,playerId:e,text:t,isTruth:!1,votes:0}),this.notify()}getShuffledAnswers(){const e=[...this.answers,{id:"truth",playerId:null,text:this.currentQuestion?.answer,isTruth:!0,votes:0}];for(let t=e.length-1;t>0;t--){const s=Math.floor(Math.random()*(t+1));[e[t],e[s]]=[e[s],e[t]]}return e}setPlayerRole(e,t){this.roles[e]=t,this.notify()}setVote(e,t,s=0){this.votes[e]=t,this.bets[e]=s,this.notify()}setSniperGuess(e){this.sniperGuess=e,this.notify()}addScore(e,t){const s=this.players.find(n=>n.id===e);s&&(s.score+=t,this.notify())}getLeaderboard(){return[...this.players].sort((e,t)=>t.score-e.score)}setPhase(e){this.phase=e,this.currentPlayerIndex=0,this.notify()}nextRound(){this.round++,this.answers=[],this.votes={},this.bets={},this.sniperGuess=null,this.roles={},this.currentPlayerIndex=0,this.notify()}isGameOver(){return this.round>=this.totalRounds}setEnabledRoles(e){e.includes("innocent")||e.unshift("innocent"),this.enabledRoles=e,this.notify()}setTimerDuration(e){this.timerDuration=e,this.notify()}saveConfiguration(){F({enabledRoles:this.enabledRoles,timerDuration:this.timerDuration,totalRounds:this.totalRounds,sipMode:this.sipMode})}loadConfiguration(){const e=H();e&&(e.enabledRoles&&(this.enabledRoles=e.enabledRoles),e.timerDuration&&(this.timerDuration=e.timerDuration),e.totalRounds&&(this.totalRounds=e.totalRounds),e.sipMode!==void 0&&(this.sipMode=e.sipMode))}setSipMode(e){this.sipMode=e,this.notify()}}const i=new Q;class K{constructor(){this.screens={},this.currentScreen=null,this.container=null}init(e){this.container=e}register(e,t){this.screens[e]=t}navigate(e,t={}){if(!this.screens[e]){console.error(`Screen "${e}" not found`);return}e!==this.currentScreen?.name&&i.update({phase:e}),this.currentScreen?.cleanup&&this.currentScreen.cleanup(),this.container.innerHTML="";const s=this.screens[e],n=new s(t);n.name=e,this.currentScreen=n;const a=n.render();this.container.appendChild(a),n.onMount&&n.onMount()}back(){this.navigate("home")}}const v=new K;function J(){return"vibrate"in navigator}function P(r){J()&&navigator.vibrate(r)}function _(){P(50)}function D(){P([50,50,100])}function x(){P([200,100,200])}function E(){P(10)}function O(){P([100,50,50,50,200])}class Y{constructor(e={}){this.data=e}render(){const e=i.hasActiveGame(),t=document.createElement("div");t.className="screen screen--centered",t.innerHTML=`
      <div class="home-content animate-fadeIn">
        <div class="home-logo">
          <span class="neon-logo animate-glow" data-text="LYERS">LYERS</span>
          <p class="home-tagline">Le jeu où mentir est un art 🎭</p>
        </div>
        
        <div class="home-actions">
          <button class="btn btn--primary" id="btn-new-game">
            <span>🎰</span>
            Nouvelle Partie
          </button>
          
          ${e?`
            <button class="btn btn--secondary" id="btn-resume">
              <span>▶️</span>
              Reprendre
            </button>
          `:""}
        </div>
        
        <div class="home-footer">
          <p class="home-credits">3 à 10 joueurs • 1 appareil</p>
        </div>
      </div>
    `,t.querySelector("#btn-new-game").addEventListener("click",()=>{_(),i.clear(),v.navigate("config")});const s=t.querySelector("#btn-resume");return s&&s.addEventListener("click",()=>{_(),i.load();const n=i.phase;n&&n!=="home"?v.navigate(n):v.navigate("config")}),t}}const U={INNOCENT:{id:"innocent",name:"L'Innocent",emoji:"😇",description:"Doit trouver la vraie réponse.",mission:"Vote pour la VRAIE réponse pour gagner des points !",color:"#10B981",isDefault:!0},AVOCAT_DIABLE:{id:"avocat_diable",name:"L'Avocat du Diable",emoji:"😈",description:"Reçoit une fausse réponse qu'il DOIT faire gagner.",missionTemplate:'Ta réponse imposée : "{assignedAnswer}". Convaincs tout le monde de voter pour elle !',color:"#EF4444",requiresAssignment:!0},SNIPER:{id:"sniper",name:"Le Sniper",emoji:"🎯",description:"Doit identifier l'Avocat du Diable.",mission:"Lors du vote final, désigne qui tu penses être l'Avocat du Diable. Si tu trouves, tu gagnes gros !",color:"#FBBF24",requiresAvocatInGame:!0},COPIEUR:{id:"copieur",name:"Le Copieur",emoji:"🪞",description:"Doit voter comme un joueur spécifique.",missionTemplate:"Tu dois voter comme {targetPlayer}. Si tu votes la même chose que lui/elle, tu gagnes un bonus !",color:"#06B6D4",requiresTarget:!0},KAMIKAZE:{id:"kamikaze",name:"Le Kamikaze",emoji:"💣",description:"Fait voter pour sa réponse, mais vote pour la vérité.",mission:"Convaincs les autres de voter pour TA réponse inventée. Mais toi, tu dois voter la vraie réponse !",color:"#F97316"},AGENT_DOUBLE:{id:"agent_double",name:"L'Agent Double",emoji:"🕵️",description:"Reçoit 2 réponses sans savoir laquelle est vraie.",missionTemplate:'Réponses possibles : "{answer1}" OU "{answer2}". Une seule est vraie, à toi de deviner !',color:"#8B5CF6",requiresDualAnswers:!0},OMBRE:{id:"ombre",name:"L'Ombre",emoji:"👻",description:"Gagne si une réponse spécifique reçoit 0 vote.",missionTemplate:'La réponse "{targetAnswer}" ne doit recevoir AUCUN vote ! Sabote-la discrètement.',color:"#64748B",requiresTargetAnswer:!0}};function z(){return Object.values(U)}function q(r){return Object.values(U).find(e=>e.id===r)}function I(r,e={}){if(r.missionTemplate){let t=r.missionTemplate;return Object.entries(e).forEach(([s,n])=>{t=t.replace(`{${s}}`,n)}),t}return r.mission}function j(r,e){return q(r),r==="sniper"&&!e.includes("avocat_diable")?{canEnable:!1,reason:"Nécessite que L'Avocat du Diable soit activé"}:{canEnable:!0}}class Z{constructor(e={}){this.data=e,this.minPlayers=3,this.maxPlayers=10}render(){i.loadConfiguration();const e=document.createElement("div");return e.className="screen",e.innerHTML=`
      <div class="screen__header animate-slideDown">
        <button class="btn btn--ghost" id="btn-back">← Retour</button>
        <h2 class="text-gradient">Configuration</h2>
      </div>
      
      <div class="screen__content">
        <!-- Section Joueurs -->
        <section class="config-section animate-slideUp stagger-1">
          <h3>👥 Joueurs</h3>
          <div class="player-list" id="player-list">
            <!-- Players will be added dynamically -->
          </div>
          <button class="btn btn--secondary" id="btn-add-player" style="margin-top: var(--spacing-md)">
            + Ajouter un joueur
          </button>
        </section>
        
        <!-- Section Rôles -->
        <section class="config-section animate-slideUp stagger-2">
          <h3>🎭 Rôles Actifs</h3>
          <p class="config-hint">Sélectionne les rôles qui seront distribués aléatoirement</p>
          <div class="role-grid" id="role-grid">
            <!-- Roles will be added dynamically -->
          </div>
        </section>
        
        <!-- Section Timer -->
        <section class="config-section animate-slideUp stagger-3">
          <h3>⏱️ Durée du débat</h3>
          <div class="slider-group">
            <div class="slider-group__header">
              <span>Temps de discussion</span>
              <span class="slider-group__value" id="timer-value">${i.timerDuration}s</span>
            </div>
            <input type="range" class="slider" id="timer-slider" 
                   min="30" max="300" step="30" value="${i.timerDuration}">
          </div>
        </section>
        
        <!-- Section Manches -->
        <section class="config-section animate-slideUp stagger-4">
          <h3>🔢 Nombre de manches</h3>
          <div class="slider-group">
            <div class="slider-group__header">
              <span>Manches à jouer</span>
              <span class="slider-group__value" id="rounds-value">${i.totalRounds}</span>
            </div>
            <input type="range" class="slider" id="rounds-slider" 
                   min="3" max="10" step="1" value="${i.totalRounds}">
          </div>
        </section>
        
        <!-- Section Mode Gorgée -->
        <section class="config-section animate-slideUp stagger-5">
          <h3>🍺 Mode Gorgée</h3>
          <p class="config-hint">Active le mode drinking game : les points deviennent des gorgées !</p>
          <div class="sip-mode-toggle">
            <label class="toggle-switch">
              <input type="checkbox" id="sip-mode-toggle" ${i.sipMode?"checked":""}>
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-label" id="sip-mode-label">${i.sipMode?"🍻 Mode Gorgée activé":"📊 Mode Points"}</span>
          </div>
        </section>
      </div>
      
      <div class="screen__footer">
        <button class="btn btn--primary" id="btn-start" disabled>
          <span>🚀</span>
          Lancer la partie
        </button>
      </div>
    `,this.screen=e,this.setupEventListeners(),this.renderPlayers(),this.renderRoles(),this.updateStartButton(),e}setupEventListeners(){this.screen.querySelector("#btn-back").addEventListener("click",()=>{E(),v.navigate("home")}),this.screen.querySelector("#btn-add-player").addEventListener("click",()=>{E(),this.addPlayer()});const e=this.screen.querySelector("#timer-slider"),t=this.screen.querySelector("#timer-value");e.addEventListener("input",c=>{const f=parseInt(c.target.value);t.textContent=`${f}s`,i.setTimerDuration(f)});const s=this.screen.querySelector("#rounds-slider"),n=this.screen.querySelector("#rounds-value");s.addEventListener("input",c=>{const f=parseInt(c.target.value);n.textContent=f,i.totalRounds=f});const a=this.screen.querySelector("#sip-mode-toggle"),m=this.screen.querySelector("#sip-mode-label");a.addEventListener("change",c=>{E(),i.setSipMode(c.target.checked),m.textContent=c.target.checked?"🍻 Mode Gorgée activé":"📊 Mode Points"}),this.screen.querySelector("#btn-start").addEventListener("click",()=>{_(),this.startGame()})}addPlayer(){if(i.players.length>=this.maxPlayers)return;const e=i.players.length+1;i.addPlayer(`Joueur ${e}`),this.renderPlayers(),this.updateStartButton()}removePlayer(e){i.removePlayer(e),this.renderPlayers(),this.updateStartButton()}renderPlayers(){const e=this.screen.querySelector("#player-list");if(i.players.length===0)for(let s=1;s<=3;s++)i.addPlayer(`Joueur ${s}`);e.innerHTML=i.players.map((s,n)=>`
      <div class="player-item" data-id="${s.id}">
        <div class="player-item__number">${n+1}</div>
        <input type="text" class="input player-item__input" 
               value="${s.name}" 
               placeholder="Nom du joueur"
               data-id="${s.id}">
        ${i.players.length>this.minPlayers?`
          <button class="player-item__remove" data-id="${s.id}">×</button>
        `:""}
      </div>
    `).join(""),e.querySelectorAll(".player-item__input").forEach(s=>{s.addEventListener("input",n=>{i.updatePlayerName(n.target.dataset.id,n.target.value)}),s.addEventListener("focus",n=>{n.target.select()})}),e.querySelectorAll(".player-item__remove").forEach(s=>{s.addEventListener("click",n=>{E(),this.removePlayer(n.target.dataset.id)})});const t=this.screen.querySelector("#btn-add-player");i.players.length>=this.maxPlayers?(t.disabled=!0,t.textContent="Maximum atteint"):(t.disabled=!1,t.textContent="+ Ajouter un joueur")}renderRoles(){const e=this.screen.querySelector("#role-grid"),t=z();e.innerHTML=t.map(s=>{const n=i.enabledRoles.includes(s.id),a=s.isDefault;return j(s.id,i.enabledRoles),`
        <div class="role-card ${n?"role-card--active":""} ${a?"role-card--default":""}" 
             data-role-id="${s.id}"
             ${a?'data-locked="true"':""}>
          <div class="checkbox">
            <input type="checkbox" 
                   id="role-${s.id}" 
                   ${n?"checked":""} 
                   ${a?"disabled":""}>
            <span class="checkbox__box"></span>
          </div>
          <div class="role-card__content">
            <div class="role-card__emoji">${s.emoji}</div>
            <div class="role-card__name">${s.name}</div>
            <div class="role-card__description">${s.description}</div>
          </div>
        </div>
      `}).join(""),e.querySelectorAll(".role-card").forEach(s=>{s.addEventListener("click",n=>{if(s.dataset.locked)return;E();const a=s.dataset.roleId,m=s.querySelector('input[type="checkbox"]');this.toggleRole(a,!m.checked),this.renderRoles()})})}toggleRole(e,t){let s=[...i.enabledRoles];if(t){const n=j(e,s);if(!n.canEnable){alert(n.reason);return}s.includes(e)||s.push(e)}else s=s.filter(n=>n!==e),e==="avocat_diable"&&(s=s.filter(n=>n!=="sniper"));i.setEnabledRoles(s)}updateStartButton(){const e=this.screen.querySelector("#btn-start");i.players.filter(s=>s.name.trim().length>0).length>=this.minPlayers?e.disabled=!1:e.disabled=!0}startGame(){if(i.players=i.players.filter(e=>e.name.trim().length>0),i.players.length<this.minPlayers){alert(`Il faut au moins ${this.minPlayers} joueurs !`);return}i.saveConfiguration(),i.round=1,i.answers=[],i.votes={},i.currentPlayerIndex=0,v.navigate("invention")}}class W{constructor(e={}){this.data=e,this.questions=[],this.showingQuestion=!1,this.currentAnswer=""}async loadQuestions(){try{const e=await fetch("/questions.json");this.questions=await e.json()}catch(e){console.error("Erreur chargement questions:",e),this.questions=[{question:"Quel est le seul aliment qui ne périme jamais ?",answer:"Le miel"}]}}async onMount(){if(await this.loadQuestions(),!i.currentQuestion){const e=Math.floor(Math.random()*this.questions.length);i.setQuestion(this.questions[e])}this.updateDisplay()}render(){const e=document.createElement("div");return e.className="screen",e.innerHTML=`
      <div class="screen__header animate-slideDown">
        <div class="round-badge">
          Manche ${i.round} / ${i.totalRounds}
        </div>
        <h2 class="text-gradient">Phase d'Invention</h2>
      </div>
      
      <div class="screen__content" id="invention-content">
        <!-- Dynamic content -->
      </div>
    `,this.screen=e,e}updateDisplay(){const e=this.screen.querySelector("#invention-content"),t=i.getCurrentPlayer();if(!t){this.finishInventionPhase();return}if(!this.showingQuestion)e.innerHTML=`
        <div class="pass-screen">
          <div class="pass-screen__emoji animate-bounce">📱</div>
          <p class="pass-screen__title">Passe le téléphone à</p>
          <p class="pass-screen__player">${t.name}</p>
          <button class="btn btn--primary" id="btn-ready">
            C'est moi, ${t.name} !
          </button>
        </div>
      `,e.querySelector("#btn-ready").addEventListener("click",()=>{_(),this.showingQuestion=!0,this.updateDisplay()});else{e.innerHTML=`
        <div class="invention-form animate-fadeIn">
          <div class="card card--glow">
            <h3 class="question-label">La question est :</h3>
            <p class="question-text">${i.currentQuestion.question}</p>
          </div>
          
          <div class="invention-input">
            <label for="answer-input">Invente une fausse réponse crédible :</label>
            <textarea 
              id="answer-input" 
              class="input textarea" 
              placeholder="Ta réponse inventée..."
              rows="3"
            >${this.currentAnswer}</textarea>
          </div>
          
          <p class="invention-hint">
            ⚠️ Ne montre pas ta réponse aux autres !
          </p>
        </div>
      `,e.innerHTML+=`
        <div class="screen__footer">
          <button class="btn btn--success" id="btn-submit" disabled>
            Valider ma réponse ✓
          </button>
        </div>
      `;const s=e.querySelector("#answer-input"),n=e.querySelector("#btn-submit");s.addEventListener("input",a=>{this.currentAnswer=a.target.value,n.disabled=this.currentAnswer.trim().length<2}),s.addEventListener("focus",()=>{E()}),n.addEventListener("click",()=>{_(),this.submitAnswer()})}}submitAnswer(){const e=i.getCurrentPlayer();i.addAnswer(e.id,this.currentAnswer.trim()),this.currentAnswer="",this.showingQuestion=!1,i.nextPlayer()?this.updateDisplay():this.finishInventionPhase()}finishInventionPhase(){i.currentPlayerIndex=0,v.navigate("roles")}}function M(r){const e=[...r];for(let t=e.length-1;t>0;t--){const s=Math.floor(Math.random()*(t+1));[e[t],e[s]]=[e[s],e[t]]}return e}function L(r){return r[Math.floor(Math.random()*r.length)]}function X(r,e,t,s){const n={},a=M(r);let m=e.filter(l=>l!=="innocent").map(l=>q(l)).filter(Boolean);m=M(m);let c=0;for(let l=0;l<a.length&&c<m.length;l++){const b=a[l],S=m[c],u={roleId:S.id,role:S,mission:S.mission||""};if(S.requiresAssignment&&t.length>0){const y=t.filter(d=>!d.isTruth&&d.playerId!==b.id);if(y.length>0){const d=L(y);u.assignedAnswer=d.text,u.assignedAnswerId=d.id,u.mission=I(S,{assignedAnswer:d.text})}}else if(S.requiresTarget){const y=r.filter(d=>d.id!==b.id);if(y.length>0){const d=L(y);u.targetPlayerId=d.id,u.targetPlayerName=d.name,u.mission=I(S,{targetPlayer:d.name})}}else if(S.requiresDualAnswers){const y=t.filter(d=>!d.isTruth&&d.playerId!==b.id);if(y.length>0){const d=L(y),[o,h]=M([s,d.text]);u.answer1=o,u.answer2=h,u.mission=I(S,{answer1:o,answer2:h})}}else if(S.requiresTargetAnswer){const y=t.filter(d=>!d.isTruth&&d.playerId!==b.id);if(y.length>0){const d=L(y);u.targetAnswer=d.text,u.targetAnswerId=d.id,u.mission=I(S,{targetAnswer:d.text})}}else S.requiresAvocatInGame?u.mission=S.mission:u.mission=I(S);n[b.id]=u,c++}const f=q("innocent");for(const l of a)n[l.id]||(n[l.id]={roleId:"innocent",role:f,mission:f.mission});return n}function ee(r){return Object.values(r).some(e=>e.roleId==="avocat_diable")}function te(r){const e=Object.entries(r).find(([t,s])=>s.roleId==="avocat_diable");return e?e[0]:null}function se(r){const e=Object.entries(r).find(([t,s])=>s.roleId==="sniper");return e?e[0]:null}class ne{constructor(e={}){this.data=e,this.isRevealed=!1}onMount(){if(Object.keys(i.roles).length===0){const e=X(i.players,i.enabledRoles,i.answers,i.currentQuestion.answer);Object.entries(e).forEach(([t,s])=>{i.setPlayerRole(t,s)})}this.updateDisplay()}render(){const e=document.createElement("div");return e.className="screen",e.innerHTML=`
      <div class="screen__header animate-slideDown">
        <div class="round-badge">
          Manche ${i.round} / ${i.totalRounds}
        </div>
        <h2 class="text-gradient">Révélation des Rôles</h2>
      </div>
      
      <div class="screen__content" id="role-content">
        <!-- Dynamic content -->
      </div>
    `,this.screen=e,e}updateDisplay(){const e=this.screen.querySelector("#role-content"),t=i.getCurrentPlayer();if(!t){this.finishRolePhase();return}i.roles[t.id],this.isRevealed||(e.innerHTML=`
        <div class="pass-screen">
          <div class="pass-screen__emoji animate-bounce">🎭</div>
          <p class="pass-screen__title">Passe le téléphone à</p>
          <p class="pass-screen__player">${t.name}</p>
          <p class="pass-hint">Tu vas découvrir ton rôle secret !</p>
          <button class="btn btn--primary" id="btn-ready">
            Je suis ${t.name}
          </button>
        </div>
      `,e.querySelector("#btn-ready").addEventListener("click",()=>{_(),this.showRevealCard()}))}showRevealCard(){const e=this.screen.querySelector("#role-content"),t=i.getCurrentPlayer(),s=i.roles[t.id],n=s.role;e.innerHTML=`
      <div class="role-reveal">
        <div class="role-reveal__card" id="role-card">
          <div class="role-reveal__front">
            <div class="card-pattern">
              <span class="mystery-icon">❓</span>
              <p>Appuie pour révéler ton rôle</p>
            </div>
          </div>
          <div class="role-reveal__back">
            <div class="revealed-role">
              <div class="revealed-role__emoji">${n.emoji}</div>
              <h3 class="revealed-role__name" style="color: ${n.color}">${n.name}</h3>
              <div class="revealed-role__mission">
                <p class="mission-label">Ta mission :</p>
                <p class="mission-text">${s.mission}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="role-actions" id="role-actions" style="display: none;">
        <p class="role-warning">⚠️ Mémorise bien ta mission et cache l'écran !</p>
        <button class="btn btn--success" id="btn-understood">
          J'ai compris, au suivant ! ✓
        </button>
      </div>
    `;const a=e.querySelector("#role-card"),m=e.querySelector("#role-actions");a.addEventListener("click",()=>{a.classList.contains("role-reveal__card--flipped")||(O(),a.classList.add("role-reveal__card--flipped"),setTimeout(()=>{m.style.display="block",m.classList.add("animate-fadeIn")},800))}),e.querySelector("#btn-understood").addEventListener("click",()=>{_(),this.isRevealed=!1,i.nextPlayer()?this.updateDisplay():this.finishRolePhase()})}finishRolePhase(){v.navigate("debate")}}let A=[],N=null;function ie(){return new Promise(r=>{if(!("speechSynthesis"in window)){console.warn("Web Speech API non supportée"),r(!1);return}const e=()=>{A=speechSynthesis.getVoices(),N=A.find(t=>t.lang.startsWith("fr"))||A.find(t=>t.lang.includes("FR"))||A[0],r(!0)};speechSynthesis.getVoices().length>0?e():(speechSynthesis.addEventListener("voiceschanged",e,{once:!0}),setTimeout(()=>{A.length===0&&e()},1e3))})}function T(r,e={}){return new Promise((t,s)=>{if(!("speechSynthesis"in window)){t();return}speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(r);n.voice=N,n.lang="fr-FR",n.rate=e.rate||.9,n.pitch=e.pitch||1,n.volume=e.volume||1,n.onend=()=>t(),n.onerror=a=>{a.error!=="canceled"?s(a):t()},speechSynthesis.speak(n)})}async function re(r,e=""){const t=e?`Réponse ${e}:`:"";await T(`${t} ${r}`,{rate:.85})}async function ae(r){await T("Et la vraie réponse était...",{rate:.7,pitch:.9}),await new Promise(e=>setTimeout(e,500)),await T(r,{rate:.8,pitch:1})}function C(){"speechSynthesis"in window&&speechSynthesis.cancel()}function G(){return"speechSynthesis"in window}class oe{constructor(e={}){this.data=e,this.timeRemaining=i.timerDuration,this.timerInterval=null,this.isPaused=!1,this.shuffledAnswers=[],this.isSpeaking=!1,this.isEnded=!1,this.tick=this.tick.bind(this)}onMount(){this.shuffledAnswers=i.getShuffledAnswers(),this.startTimer(),this.updateDisplay()}cleanup(){this.isEnded=!0,this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),C()}render(){const e=document.createElement("div");return e.className="screen",e.innerHTML=`
      <div class="screen__header animate-slideDown">
        <div class="round-badge">
          Manche ${i.round} / ${i.totalRounds}
        </div>
        <h2 class="text-gradient">Débat !</h2>
      </div>
      
      <div class="screen__content" id="debate-content">
        <!-- Dynamic content -->
      </div>
      
      <div class="screen__footer">
        <button class="btn btn--primary" id="btn-end-debate">
          Passer au vote 🗳️
        </button>
      </div>
    `,this.screen=e,e.querySelector("#btn-end-debate").addEventListener("click",()=>{_(),this.endDebate()}),e}updateDisplay(){const e=this.screen.querySelector("#debate-content");if(!e)return;const t="ABCDEFGHIJ".split("");e.innerHTML=`
      <div class="debate-timer animate-scaleIn">
        <div class="timer ${this.timeRemaining<=30?"timer--warning":""}" id="timer-container">
          <div class="timer__display" id="timer-display">
            ${this.formatTime(this.timeRemaining)}
          </div>
          <div class="timer__label">Temps restant</div>
        </div>
        <div class="timer-controls">
          <button class="btn btn--ghost btn--icon" id="btn-pause">
            ${this.isPaused?"▶️":"⏸️"}
          </button>
        </div>
      </div>
      
      <div class="debate-question card">
        <p class="question-label">Question :</p>
        <p class="question-text">${i.currentQuestion.question}</p>
      </div>
      
      <div class="debate-answers">
        <h3>Les réponses proposées :</h3>
        <div class="answer-list" id="answer-list">
          ${this.shuffledAnswers.map((n,a)=>`
            <div class="answer-item" data-index="${a}">
              <span class="answer-item__letter">${t[a]}</span>
              <span class="answer-item__text">${n.text}</span>
              ${G()?`
                <button class="btn btn--ghost btn--icon speak-btn" data-index="${a}">
                  🔊
                </button>
              `:""}
            </div>
          `).join("")}
        </div>
      </div>
    `;const s=e.querySelector("#btn-pause");s&&s.addEventListener("click",()=>{this.togglePause()}),e.querySelectorAll(".speak-btn").forEach(n=>{n.addEventListener("click",async a=>{a.stopPropagation();const m=parseInt(n.dataset.index);await this.speakAnswerAtIndex(m)})})}startTimer(){this.timerInterval&&clearInterval(this.timerInterval),this.timerInterval=setInterval(this.tick,1e3)}tick(){if(this.isEnded||!this.screen){this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null);return}if(!this.isPaused){this.timeRemaining--;const e=this.screen.querySelector("#timer-display"),t=this.screen.querySelector("#timer-container");e&&(e.textContent=this.formatTime(this.timeRemaining)),this.timeRemaining<=30&&t&&t.classList.add("timer--warning"),(this.timeRemaining===30||this.timeRemaining===10)&&x(),this.timeRemaining<=0&&this.endDebate()}}togglePause(){this.isPaused=!this.isPaused;const e=this.screen?.querySelector("#btn-pause");e&&(e.textContent=this.isPaused?"▶️":"⏸️")}formatTime(e){e<0&&(e=0);const t=Math.floor(e/60),s=e%60;return`${t}:${s.toString().padStart(2,"0")}`}async speakAnswerAtIndex(e){if(this.isSpeaking){C(),this.isSpeaking=!1;return}const t=this.shuffledAnswers[e],s="ABCDEFGHIJ".split("");this.isSpeaking=!0;try{const n=this.isPaused;if(this.isPaused=!0,await re(t.text,s[e]),!n&&!this.isEnded){this.isPaused=!1;const a=this.screen?.querySelector("#btn-pause");a&&(a.textContent="⏸️")}}catch(n){console.error("Erreur lecture:",n)}this.isSpeaking=!1}endDebate(){this.isEnded||(this.isEnded=!0,this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),C(),i.currentPlayerIndex=0,v.navigate("voting"))}}class le{constructor(e={}){this.data=e,this.shuffledAnswers=[],this.selectedAnswerId=null,this.betAmount=0,this.showingVote=!1,this.sniperGuess=null}onMount(){this.shuffledAnswers=i.getShuffledAnswers(),this.updateDisplay()}render(){const e=document.createElement("div");return e.className="screen",e.innerHTML=`
      <div class="screen__header animate-slideDown">
        <div class="round-badge">
          Manche ${i.round} / ${i.totalRounds}
        </div>
        <h2 class="text-gradient">Vote !</h2>
      </div>
      
      <div class="screen__content" id="voting-content">
        <!-- Dynamic content -->
      </div>
    `,this.screen=e,e}updateDisplay(){const e=this.screen.querySelector("#voting-content"),t=i.getCurrentPlayer();if(!t){this.finishVotingPhase();return}this.showingVote?this.showVotingForm():(e.innerHTML=`
        <div class="pass-screen">
          <div class="pass-screen__emoji animate-bounce">🗳️</div>
          <p class="pass-screen__title">Passe le téléphone à</p>
          <p class="pass-screen__player">${t.name}</p>
          <p class="pass-hint">C'est l'heure de voter !</p>
          <button class="btn btn--primary" id="btn-ready">
            Je suis ${t.name}
          </button>
        </div>
      `,e.querySelector("#btn-ready").addEventListener("click",()=>{_(),this.showingVote=!0,this.selectedAnswerId=null,this.betAmount=0,this.sniperGuess=null,this.updateDisplay()}))}showVotingForm(){const e=this.screen.querySelector("#voting-content"),t=i.getCurrentPlayer(),s=i.roles[t.id],n="ABCDEFGHIJ".split(""),a=s?.roleId==="sniper",m=ee(i.roles);e.innerHTML=`
      <div class="voting-form animate-fadeIn">
        <!-- Rappel du rôle -->
        <div class="role-reminder card">
          <div class="role-reminder__header">
            <span class="role-reminder__emoji">${s?.role?.emoji||"😇"}</span>
            <span class="role-reminder__name">${s?.role?.name||"Innocent"}</span>
          </div>
          <p class="role-reminder__mission">${s?.mission||"Vote pour la vraie réponse !"}</p>
        </div>
        
        <!-- Question -->
        <div class="voting-question">
          <p class="question-label">Question :</p>
          <p class="question-text">${i.currentQuestion.question}</p>
        </div>
        
        <!-- Choix des réponses -->
        <div class="voting-choices">
          <h3>Choisis une réponse :</h3>
          <div class="answer-list" id="answer-list">
            ${this.shuffledAnswers.map((c,f)=>{const l=c.playerId===t.id;return`
                <button class="answer-item ${this.selectedAnswerId===c.id?"answer-item--selected":""} ${l?"answer-item--disabled":""}" 
                        data-answer-id="${c.id}"
                        ${l?"disabled":""}>
                  <span class="answer-item__letter">${n[f]}</span>
                  <span class="answer-item__text">${c.text}</span>
                  ${l?'<span class="own-badge">Ta réponse</span>':""}
                </button>
              `}).join("")}
          </div>
        </div>
        
        ${a&&m?`
          <!-- Section Sniper -->
          <div class="sniper-section card" style="border-color: var(--neon-yellow);">
            <h3>🎯 Mission Sniper</h3>
            <p>Qui penses-tu être l'Avocat du Diable ?</p>
            <div class="sniper-choices" id="sniper-choices">
              ${i.players.filter(c=>c.id!==t.id).map(c=>`
                <button class="btn ${this.sniperGuess===c.id?"btn--primary":"btn--secondary"} sniper-choice" 
                        data-player-id="${c.id}">
                  ${c.name}
                </button>
              `).join("")}
            </div>
          </div>
        `:""}
      </div>
      
      <div class="screen__footer">
        <button class="btn btn--success" id="btn-submit-vote" ${this.selectedAnswerId?"":"disabled"}>
          Confirmer mon vote ✓
        </button>
      </div>
    `,e.querySelectorAll(".answer-item:not(.answer-item--disabled)").forEach(c=>{c.addEventListener("click",()=>{E(),this.selectedAnswerId=c.dataset.answerId,this.updateVoteSelection()})}),e.querySelectorAll(".sniper-choice").forEach(c=>{c.addEventListener("click",()=>{E(),this.sniperGuess=c.dataset.playerId,this.updateSniperSelection()})}),e.querySelector("#btn-submit-vote").addEventListener("click",()=>{_(),this.submitVote()})}updateVoteSelection(){const e=this.screen.querySelector("#voting-content");e.querySelectorAll(".answer-item").forEach(s=>{s.dataset.answerId===this.selectedAnswerId?s.classList.add("answer-item--selected"):s.classList.remove("answer-item--selected")});const t=e.querySelector("#btn-submit-vote");t.disabled=!this.selectedAnswerId}updateSniperSelection(){const e=this.screen.querySelector("#sniper-choices");e&&e.querySelectorAll(".sniper-choice").forEach(t=>{t.dataset.playerId===this.sniperGuess?(t.classList.remove("btn--secondary"),t.classList.add("btn--primary")):(t.classList.remove("btn--primary"),t.classList.add("btn--secondary"))})}submitVote(){const e=i.getCurrentPlayer();i.setVote(e.id,this.selectedAnswerId,this.betAmount),i.roles[e.id]?.roleId==="sniper"&&this.sniperGuess&&i.setSniperGuess(this.sniperGuess),this.showingVote=!1,this.selectedAnswerId=null,this.betAmount=0,this.sniperGuess=null,i.nextPlayer()?this.updateDisplay():this.finishVotingPhase()}finishVotingPhase(){v.navigate("results")}}const ce={FOUND_TRUTH:10,FOOLED_PLAYER:5,AVOCAT_SUCCESS:15,SNIPER_SUCCESS:20,SNIPER_FAILURE:-5,COPIEUR_SUCCESS:8,KAMIKAZE_SUCCESS:12,OMBRE_SUCCESS:10,BET_MULTIPLIER:2},de={FOUND_TRUTH:2,FOOLED_PLAYER:1,AVOCAT_SUCCESS:3,SNIPER_SUCCESS:3,SNIPER_FAILURE:-2,COPIEUR_SUCCESS:2,KAMIKAZE_SUCCESS:2,OMBRE_SUCCESS:2,BET_MULTIPLIER:1};function ue(r){return r?de:ce}function he(r){const{players:e,answers:t,votes:s,bets:n,roles:a,currentQuestion:m,sniperGuess:c,sipMode:f}=r,l=ue(f),b={playerResults:{},revealedAnswers:[],highlights:[]},S=[...t,{id:"truth",playerId:null,text:m.answer,isTruth:!0}],u={};S.forEach(o=>u[o.id]=0),Object.values(s).forEach(o=>{u[o]!==void 0&&u[o]++}),e.forEach(o=>{b.playerResults[o.id]={playerId:o.id,playerName:o.name,role:a[o.id],pointsEarned:0,breakdown:[]}}),Object.entries(s).forEach(([o,h])=>{const p=b.playerResults[o];if(p&&h==="truth"){const R=(n[o]||0)>0?l.BET_MULTIPLIER:1,w=l.FOUND_TRUTH*R;p.pointsEarned+=w,p.breakdown.push({reason:f?`${w} gorgée(s) à distribuer !`:"Trouvé la vraie réponse",points:w,emoji:"✅"})}}),t.forEach(o=>{const h=b.playerResults[o.playerId];if(!h)return;const p=u[o.id]||0;if(p>0){const g=p*l.FOOLED_PLAYER;h.pointsEarned+=g,h.breakdown.push({reason:f?`${g} gorgée(s) à distribuer (${p} trompés)`:`${p} joueur(s) ont voté pour ta réponse`,points:g,emoji:"🎭"})}});const y=te(a);if(y){const o=a[y],h=b.playerResults[y],p=o.assignedAnswerId,g=u[p]||0,R=Math.max(...Object.values(u));g===R&&g>0&&(h.pointsEarned+=l.AVOCAT_SUCCESS,h.breakdown.push({reason:f?`${l.AVOCAT_SUCCESS} gorgée(s) à distribuer !`:"Mission accomplie ! Ta réponse imposée a gagné",points:l.AVOCAT_SUCCESS,emoji:"😈"}),b.highlights.push({type:"avocat_success",playerId:y,message:`${h.playerName} était l'Avocat du Diable et a réussi sa mission !`}))}const d=se(a);if(d&&c){const o=b.playerResults[d];y&&c===y?(o.pointsEarned+=l.SNIPER_SUCCESS,o.breakdown.push({reason:f?`${l.SNIPER_SUCCESS} gorgée(s) à distribuer !`:"Tu as identifié l'Avocat du Diable !",points:l.SNIPER_SUCCESS,emoji:"🎯"}),b.highlights.push({type:"sniper_success",playerId:d,message:`${o.playerName} a démasqué l'Avocat du Diable !`})):y&&(o.pointsEarned+=l.SNIPER_FAILURE,o.breakdown.push({reason:f?`${Math.abs(l.SNIPER_FAILURE)} gorgée(s) à boire !`:"Tu t'es trompé sur l'identité de l'Avocat",points:l.SNIPER_FAILURE,emoji:"🍺"}))}return Object.entries(a).forEach(([o,h])=>{if(h.roleId!=="copieur")return;const p=b.playerResults[o],g=h.targetPlayerId;g&&s[o]===s[g]&&(p.pointsEarned+=l.COPIEUR_SUCCESS,p.breakdown.push({reason:f?`${l.COPIEUR_SUCCESS} gorgée(s) à distribuer !`:`Tu as copié ${h.targetPlayerName} avec succès`,points:l.COPIEUR_SUCCESS,emoji:"🪞"}))}),Object.entries(a).forEach(([o,h])=>{if(h.roleId!=="kamikaze")return;const p=b.playerResults[o],g=t.find(w=>w.playerId===o),R=s[o];g&&R==="truth"&&(u[g.id]||0)>0&&(p.pointsEarned+=l.KAMIKAZE_SUCCESS,p.breakdown.push({reason:f?`${l.KAMIKAZE_SUCCESS} gorgée(s) à distribuer !`:"Mission Kamikaze réussie !",points:l.KAMIKAZE_SUCCESS,emoji:"💣"}))}),Object.entries(a).forEach(([o,h])=>{if(h.roleId!=="ombre")return;const p=b.playerResults[o],g=h.targetAnswerId;g&&u[g]===0&&(p.pointsEarned+=l.OMBRE_SUCCESS,p.breakdown.push({reason:f?`${l.OMBRE_SUCCESS} gorgée(s) à distribuer !`:"Ta cible n'a reçu aucun vote",points:l.OMBRE_SUCCESS,emoji:"👻"}))}),b.revealedAnswers=S.map(o=>{const h=e.find(p=>p.id===o.playerId);return{...o,authorName:h?h.name:"La vraie réponse",votesReceived:u[o.id]||0,voters:Object.entries(s).filter(([p,g])=>g===o.id).map(([p])=>e.find(g=>g.id===p)?.name).filter(Boolean)}}),b}function pe(r,e){Object.entries(e.playerResults).forEach(([t,s])=>{r.addScore(t,s.pointsEarned)})}class me{constructor(e={}){this.data=e,this.results=null,this.currentRevealIndex=0,this.revealComplete=!1,this.showingLeaderboard=!1}onMount(){this.results=he(i),pe(i,this.results),this.showAnswerReveal()}cleanup(){C()}render(){const e=document.createElement("div");return e.className="screen",e.innerHTML=`
      <div class="screen__header animate-slideDown">
        <div class="round-badge">
          Manche ${i.round} / ${i.totalRounds}
        </div>
        <h2 class="text-gradient">Révélation !</h2>
      </div>
      
      <div class="screen__content" id="results-content">
        <!-- Dynamic content -->
      </div>
    `,this.screen=e,e}showAnswerReveal(){const e=this.screen.querySelector("#results-content"),t="ABCDEFGHIJ".split("");e.innerHTML=`
      <div class="reveal-section animate-fadeIn">
        <div class="question-recap card">
          <p class="question-label">La question était :</p>
          <p class="question-text">${i.currentQuestion.question}</p>
        </div>
        
        <div class="answers-reveal" id="answers-reveal">
          ${this.results.revealedAnswers.map((n,a)=>`
            <div class="answer-reveal-item ${n.isTruth?"answer-reveal-item--truth":""}" 
                 data-index="${a}"
                 style="opacity: 0; transform: translateY(20px);">
              <div class="answer-reveal-item__header">
                <span class="answer-reveal-item__letter">${t[a]}</span>
                <span class="answer-reveal-item__text">${n.text}</span>
              </div>
              <div class="answer-reveal-item__details">
                <div class="answer-reveal-item__author">
                  ${n.isTruth?"✅ LA VRAIE RÉPONSE":`✍️ ${n.authorName}`}
                </div>
                <div class="answer-reveal-item__votes">
                  ${n.votesReceived>0?`🗳️ ${n.votesReceived} vote(s): ${n.voters.join(", ")}`:"🗳️ Aucun vote"}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
        
        ${G()?`
          <button class="btn btn--secondary" id="btn-speak-truth">
            🔊 Lire la vraie réponse
          </button>
        `:""}
      </div>
      
      <div class="screen__footer">
        <button class="btn btn--primary" id="btn-show-scores">
          Voir les scores 📊
        </button>
      </div>
    `,this.animateReveal();const s=e.querySelector("#btn-speak-truth");s&&s.addEventListener("click",async()=>{await ae(i.currentQuestion.answer)}),e.querySelector("#btn-show-scores").addEventListener("click",()=>{_(),this.showScores()})}async animateReveal(){const e=this.screen.querySelectorAll(".answer-reveal-item");for(let t=0;t<e.length;t++){await new Promise(n=>setTimeout(n,500));const s=e[t];s.style.transition="all 0.5s ease",s.style.opacity="1",s.style.transform="translateY(0)",s.classList.contains("answer-reveal-item--truth")&&O()}}showScores(){const e=this.screen.querySelector("#results-content");e.innerHTML=`
      <div class="scores-section animate-fadeIn">
        <h3 class="text-center mb-lg">Résultats de la manche</h3>
        
        <!-- Highlights -->
        ${this.results.highlights.length>0?`
          <div class="highlights">
            ${this.results.highlights.map(t=>`
              <div class="highlight-card card animate-scaleIn">
                <p class="highlight-text">${t.message}</p>
              </div>
            `).join("")}
          </div>
        `:""}
        
        <!-- Détails par joueur -->
        <div class="player-results">
          ${Object.values(this.results.playerResults).sort((t,s)=>s.pointsEarned-t.pointsEarned).map((t,s)=>`
              <div class="player-result-card card animate-slideUp stagger-${s+1}">
                <div class="player-result-card__header">
                  <div class="player-result-card__info">
                    <span class="player-result-card__emoji">${t.role?.role?.emoji||"😇"}</span>
                    <span class="player-result-card__name">${t.playerName}</span>
                  </div>
                  <span class="player-result-card__points ${t.pointsEarned>0?"positive":t.pointsEarned<0?"negative":""}">
                    ${t.pointsEarned>0?"+":""}${t.pointsEarned} pts
                  </span>
                </div>
                <div class="player-result-card__breakdown">
                  ${t.breakdown.map(n=>`
                    <div class="breakdown-item">
                      <span>${n.emoji} ${n.reason}</span>
                      <span class="${n.points>=0?"positive":"negative"}">
                        ${n.points>=0?"+":""}${n.points}
                      </span>
                    </div>
                  `).join("")}
                </div>
                <div class="player-result-card__role">
                  Rôle : ${t.role?.role?.name||"Innocent"}
                </div>
              </div>
            `).join("")}
        </div>
      </div>
      
      <div class="screen__footer">
        <button class="btn btn--primary" id="btn-leaderboard">
          Classement général 🏆
        </button>
      </div>
    `,D(),e.querySelector("#btn-leaderboard").addEventListener("click",()=>{_(),this.showLeaderboard()})}showLeaderboard(){const e=this.screen.querySelector("#results-content"),t=i.getLeaderboard(),s=i.isGameOver();e.innerHTML=`
      <div class="leaderboard-section animate-fadeIn">
        ${s?`
          <div class="game-over-banner">
            <h2 class="text-gradient animate-neon">🎉 FIN DE PARTIE 🎉</h2>
          </div>
        `:""}
        
        <div class="leaderboard">
          ${t.map((n,a)=>`
            <div class="leaderboard__item ${a===0?"leaderboard__item--first":""} animate-slideInLeft stagger-${a+1}">
              <div class="leaderboard__rank">
                ${a===0?"👑":a+1}
              </div>
              <div class="leaderboard__name">${n.name}</div>
              <div class="leaderboard__score">${n.score} pts</div>
            </div>
          `).join("")}
        </div>
        
        ${s&&t.length>0?`
          <div class="winner-announcement animate-scaleIn">
            <p class="winner-label">Le grand gagnant est...</p>
            <p class="winner-name text-gradient">${t[0].name} 🏆</p>
          </div>
        `:""}
      </div>
      
      <div class="screen__footer">
        ${s?`
          <button class="btn btn--primary" id="btn-new-game">
            Nouvelle partie 🎰
          </button>
        `:`
          <button class="btn btn--primary" id="btn-next-round">
            Manche suivante →
          </button>
        `}
      </div>
    `,s?(D(),this.createConfetti(),e.querySelector("#btn-new-game").addEventListener("click",()=>{_(),i.clear(),v.navigate("home")})):e.querySelector("#btn-next-round").addEventListener("click",()=>{_(),this.startNextRound()})}createConfetti(){const e=["#8B5CF6","#EC4899","#06B6D4","#10B981","#FBBF24"],t=document.createElement("div");t.className="confetti-container";for(let s=0;s<50;s++){const n=document.createElement("div");n.className="confetti",n.style.left=`${Math.random()*100}%`,n.style.backgroundColor=e[Math.floor(Math.random()*e.length)],n.style.animationDelay=`${Math.random()*2}s`,n.style.animationDuration=`${2+Math.random()*2}s`,t.appendChild(n)}document.body.appendChild(t),setTimeout(()=>{t.remove()},5e3)}startNextRound(){i.nextRound(),i.currentQuestion=null,v.navigate("invention")}}async function ve(){console.log("🎰 LYERS - Initialisation..."),await ie();const r=document.querySelector("#app");v.init(r),v.register("home",Y),v.register("config",Z),v.register("invention",W),v.register("roles",ne),v.register("debate",oe),v.register("voting",le),v.register("results",me),i.hasActiveGame()&&i.load(),v.navigate("home"),console.log("🎰 LYERS - Prêt !")}document.addEventListener("DOMContentLoaded",ve);document.addEventListener("visibilitychange",()=>{if(document.hidden){const r=new CustomEvent("app:pause");document.dispatchEvent(r)}});document.body.addEventListener("touchmove",r=>{r.touches.length>1&&r.preventDefault()},{passive:!1});

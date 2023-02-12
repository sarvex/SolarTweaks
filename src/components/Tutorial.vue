<template>
  <div id="tutorial-container" v-if="$store.state.isShowingTutorial">
    <button class="titlebar-button" @click="closeWindow()">
      <i class="fa-solid fa-xmark fa-2x titlebar-button-icon"></i>
    </button>
    <div
      class="tutorial-content"
      :style="`background: linear-gradient(0deg, rgb(19 19 19 / 100%), rgb(19 19 19 / 50%)),
    url(${require(`@/assets/cards-backgrounds/tutorial-1.png`)}) no-repeat center center;`"
    >
      <div class="tutorial-items" v-if="currentStage === -1">
        <h1 class="tutorial-title">Select a Language</h1>
        <select
          name="language-selector"
          id="language-selector"
          v-model="selectedLanguage"
        >
          <option
            v-for="language in Object.keys(availableStages)"
            :key="language"
            :value="language"
          >
            {{ language }}
          </option>
        </select>
        <div class="tutorial-controls">
          <button id="language-selector-done" @click="handleStage">Done</button>
        </div>
      </div>
      <div class="tutorial-items" v-else>
        <img
          class="tutorial-image"
          :src="`${availableStages[selectedLanguage][currentStage].background}`"
        />
        <h1 class="tutorial-title">
          {{ availableStages[selectedLanguage][currentStage].title }}
        </h1>
        <p class="tutorial-text">
          {{ availableStages[selectedLanguage][currentStage].text }}
        </p>
        <div class="tutorial-controls">
          <button v-if="currentStage > 0" @click="goBack">Back</button>
          <div class="tutorial-stages">
            <span
              v-for="(stage, index) in availableStages[selectedLanguage]"
              :key="index"
              :class="{ 'tutorial-stage-active': index === currentStage }"
            ></span>
          </div>
          <button id="tutorial-change-stage" @click="handleStage">
            {{
              currentStage === availableStages[selectedLanguage].length - 1
                ? 'Complete'
                : 'Next'
            }}
          </button>
        </div>
      </div>
    </div>
    <h4 class="tutorial-footer">
      Version {{ version }} {{ os }} <b> {{ served ? 'SERVED' : 'PROD' }}</b>
    </h4>
  </div>
</template>

<script>
import { remote } from 'electron';
import { platform } from 'process';
import settings from 'electron-settings';

export default {
  name: 'ShowTutorial',

  data: () => ({
    currentStage: -1,
    version: remote.app.getVersion(),
    selectedLanguage: 'English',
    availableStages: {
      English: [
        {
          background: '',
          title: 'Welcome!',
          text: `To begin the tutorial, click on the large blue button located at the bottom of the interface. It is recommended to carefully read and pay attention to the tutorial to fully understand the interface. If any issues are encountered, the documentation website linked below can be visited for further assistance.`,
        },
        {
          background: '',
          title: 'Selecting JRE',
          text: 'To select and download a JRE, navigate to the Settings tab and scroll down to the "JRE Downloader" section. Select a JRE and click the "download" button. Wait for the download to complete and then click the "apply" button to finish the process.',
        },
        {
          background: '',
          title: 'Modifying Engine',
          text: 'To modify the configurations of a module listed in the Engine tab, click the "options" label above the toggle enable/disable button and adjust the existing configurations as desired.',
        },
        {
          background: '',
          title: 'Downloading Logs',
          text: 'To download logs, go to the About tab and scroll to the "Launcher Information" card. On the right side of the card, you will see a "download logs" button. Click on it to download the logs.',
        },
        {
          background: '',
          title: 'Adding a Server',
          text: 'To add a server, go to the Servers tab and click on the "+" icon. You will be prompted to enter required information for the server. If you want to add the server to the Quick Play section on the home tab, click on the star icon while hovering over the server card.',
        },
        {
          background: '',
          title: 'The End',
          text: 'Hope you have fun and a better understanding after going throughout this tutorial.',
        },
      ],
      Italian: [
        {
          background: '',
          title: 'Benvenuto/a!',
          text: `Per iniziare il tutorial, cliccare sul bottone grande bottone blu posizionato nella parte bassa dell'interfaccia. E' consigliato leggere con molta attenzione per capire il funzionamento dell'interfaccia. Se ci fosse qualche problema, il sito per la documentazione è qui sotto e può essere visitato per ulteriore assistenza.`,
        },
        {
          background: '',
          title: 'Selezionare il JRE',
          text: 'Per selezionare e scaricare un JRE, navigare alla pagina delle Impostazioni e scendere fino al "JRE Downloader". Selezionare un JRE e cliccare il bottone di "download". Aspettare che lo scaricamento finisca e poi cliccare il bottone "apply" per finire il processo.',
        },
        {
          background: '',
          title: "Modificare l'engine",
          text: 'Per modificare le configurazioni di un modulo elencato nella pagina Engine, cliccare l etichetta "options" sopra il bottone di enable/disable e regolare la configurazione già esistente come desiderato.',
        },
        {
          background: '',
          title: 'Scaricare i Logs',
          text: 'Per scaricare i logs, andare sulla scheda About e scendere alla carta "Launcher information". Sulla parte destra della carta, si vedrà un bottone di "download logs". Cliccarlo per scaricare i logs.',
        },
        {
          background: '',
          title: 'Aggiungere un server',
          text: 'Per aggiungere un server, andare sulla scheda Servers e cliccare sull\'icona "+". Sarà richiesto di inserire le informazioni necessarie per il server. Se si vuole aggiungere il server nella sezione Quick Play nel menù, cliccare sull\'icona della stella mentre si è sopra la carta del server.',
        },
        {
          background: '',
          title: 'Fine',
          text: "Speriamo vi divertiate e che abbiate un'idea più chiara dopo aver trattato questo tutorial.",
        },
      ],
      German: [
        {
          background: '',
          title: 'Willkommen!',
          text: `Um das Tutorial zu beginnen, klicke den großen blauen Knopf unten in der Benutzeroberfläche. Es wird empfohlen, das Tutorial sorgfältig zu lesen und aufmerksam zu verfolgen, um die Benutzeroberfläche vollständig zu verstehen. Wenn Probleme auftreten, kann die unten verlinkte Dokumentationswebsite für weitere Hilfe besucht werden.`,
        },
        {
          background: '',
          title: 'JRE auswählen',
          text: 'Um eine JRE auszuwählen und herunterzuladen, gehe zum Einstellungstab und scrolle zum "JRE Downloader" Abschnitt. Wähle eine JRE aus und klicke und klicke "Download". Warte bis der Download abgeschlossen ist und klicke dann auf "Apply" um den Prozess abzuschließen.',
        },
        {
          background: '',
          title: 'Engine modifizieren',
          text: 'Um die Konfigurationen eines im Engine Tab aufgeführten Modul zu modifizieren, klicke auf das "Options" Label über dem Schalter zum aktivieren/deaktivieren und passe die bestehenden Konfigurationen an.',
        },
        {
          background: '',
          title: 'Logs herunterladen',
          text: 'Um die Logs herunterzuladen, gehe zum About Tab und scrolle zum "Launcher Information" Karte. Auf der rechten Seite der Karte, findest du einen "Download Logs" Knopf. Klicke auf ihn, um die Logs herunterzuladen.',
        },
        {
          background: '',
          title: 'Server hinzufügen',
          text: 'Um einen Server hinzuzufügen, gehe zum Server Tab und klicke auf den "Add Server" Knopf. Fülle die Felder aus und klicke auf "Save" um den Server hinzuzufügen.',
        },
        {
          background: '',
          title: 'Das Ende',
          text: 'Wir hoffen, dass du Spaß und ein besseres Verständnis hast, nachdem du dieses Tutorial durchgegangen bist.',
        },
      ],
      Portuguese: [
        {
          background: '',
          title: 'Bem-vindo!',
          text: `Para começar o tutorial, clique no grande botão azul localizado na parte inferior da interface. Recomenda-se ler atentamente e prestar atenção ao tutorial para entender completamente a interface. Se algum problema for encontrado, o site de documentação vinculado abaixo pode ser visitado para obter mais assistência.`,
        },
        {
          background: '',
          title: 'Selecionando JRE',
          text: 'Para selecionar e baixar um JRE, navegue até a guia configurações e role para baixo até a seção "JRE Downloader". Selecione um JRE e clique no botão "Download". Aguarde a conclusão do download e, em seguida, clique no botão "Apply" para concluir o processo.',
        },
        {
          background: '',
          title: 'Modificando o motor',
          text: 'Para modificar as configurações de um módulo listado na guia motor, clique no rótulo "Options" acima do botão de ativação/desativação de alternância e ajuste as configurações existentes conforme desejado.',
        },
        {
          background: '',
          title: 'Baixando registros',
          text: 'Para baixar os registros, vá para a guia Sobre e role até o cartão "Launcher Information". No lado direito do cartão, você verá um botão "Download Logs". Clique nele para baixar os registros.',
        },
        {
          background: '',
          title: 'Adicionando um servidor',
          text: 'Para adicionar um servidor, vá para a guia Servidores e clique no ícone "+". Você será solicitado a inserir as informações necessárias para o servidor.  Se você quiser adicionar o servidor à seção "Quick Play" na guia inicial, clique no ícone de estrela enquanto passa o mouse sobre a placa do servidor.',
        },
        {
          background: '',
          title: 'Fim',
          text: 'Espero que você se divirta e compreenda melhor depois de passar por este tutorial.',
        },
      ],
      Mandarin: [
        {
          background: '',
          title: '欢迎!',
          text: `要开始本教程，请单击位于界面底部的蓝色大按钮。 建议认真阅读并关注教程，全面了解界面。 如果遇到任何问题，可以访问下面链接的文档网站以获得进一步的帮助。要开始本教程，请单击位于界面底部的蓝色大按钮。 建议认真阅读并关注教程，全面了解界面。 如果遇到任何问题，可以访问下面链接的文档网站以获得进一步的帮助。`,
        },
        {
          background: '',
          title: '选择 JRE',
          text: '要选择并下载 JRE，请导航到“设置”选项卡并向下滚动到“JRE 下载程序”部分。 选择一个 JRE 并单击“下载”按钮。 等待下载完成，然后单击“应用”按钮以完成该过程。要选择并下载 JRE，请导航到“设置”选项卡并向下滚动到“JRE 下载程序”部分。 选择一个 JRE 并单击“下载”按钮。 等待下载完成，然后单击“应用”按钮以完成该过程。',
        },
        {
          background: '',
          title: '修改 Engine',
          text: '要修改 Engine 选项卡中列出的模块的配置，请单击切换启用/禁用按钮上方的“选项”标签，并根据需要调整现有配置。要修改“引擎”选项卡中列出的模块的配置，请单击切换启用/禁用按钮上方的“选项”标签，并根据需要调整现有配置。',
        },
        {
          background: '',
          title: '下载日志下载日志',
          text: '要下载日志，请转到“关于”选项卡并滚动到“启动器信息”卡片。 在卡片的右侧，您会看到一个“下载日志”按钮。 单击它以下载日志。要下载日志，请转到“关于”选项卡并滚动到“启动器信息”卡片。 在卡片的右侧，您会看到一个“下载日志”按钮。 单击它以下载日志。',
        },
        {
          background: '',
          title: '添加服务器添加服务器',
          text: '要添加服务器，请转到“服务器”选项卡并单击“+”图标。 系统将提示您输入服务器所需的信息。 如果您想将服务器添加到主页选项卡上的“快速播放”部分，请将鼠标悬停在服务器卡片上并单击星形图标。要添加服务器，请转到“服务器”选项卡并单击“+”图标。 系统将提示您输入服务器所需的信息。 如果您想将服务器添加到主页选项卡上的“快速播放”部分，请将鼠标悬停在服务器卡片上并单击星形图标。',
        },
        {
          background: '',
          title: '结束',
          text: '希望您在完成本教程后获得乐趣并更好地理解。',
        },
      ],
      Vietnamese: [
        {
          background: '',
          title: 'Chào Mừng!',
          text: 'Đầu tiên, ấn vào nút màu xanh biển nằm ở giữa giao diện. Việc chú ý đọc phần hướng dẫn là cần thiết để hiểu toàn bộ giao diện game. Nếu có bất kì lỗi nào, link ở dưới sẽ đưa bạn đến web hỗ trợ.',
        },
        {
          background: '',
          title: 'Chọn JRE',
          text: 'Để chọn và tải JRE, chuyển sang tab Settings và kéo xuống phần "JRE Downloader". Chọn 1 JRE và ấn nút "Download". Chờ cho đến khi tải xuống được hoàn thành và ấn "Apply" để hoàn thành tiến trình.',
        },
        {
          background: '',
          title: 'Sửa đổi tính năng',
          text: 'Để sửa các tính năng được liệt kê ở tab Engine, ấn vào ô "options" trên nút tùy chỉnh enable/disable và cài đặt dựa theo những tùy chọn cho sẵn và theo nhu cầu.',
        },
        {
          background: '',
          title: 'Tải Logs',
          text: 'Để tải Logs (Là những thông tin được lưu trữ từ lúc bật game đến giờ), vào tab "About" và kéo xuống cho đến khi thấy phần "Launcher Information". Ấn vào nó và Logs sẽ được tải về.',
        },
        {
          background: '',
          title: 'Thêm Máy Chủ',
          text: 'Để thêm máy chủ, vào tab Servers và ấn vào dấu "+". Bạn sẽ cần thêm những thông tin vào để cài đặt được máy chủ. Nếu bạn muốn thêm máy chủ vào phần Chơi Nhanh trong tab Home, ấn vào dấu sao của máy chủ bạn vừa tạo.',
        },
        {
          background: '',
          title: 'Kết Thúc',
          text: 'Chúc bạn vui vẻ và có hiểu biết hơn sau khi trải qua phần tutorial này (toi thich sech lam hihi)',
        },
      ],
    },
    os:
      platform === 'win32'
        ? 'Windows'
        : platform === 'darwin'
        ? 'MacOS'
        : platform === 'linux'
        ? 'Linux'
        : `Unknown (${platform})`,

    served: !remote.app.isPackaged,
  }),

  methods: {
    closeWindow() {
      remote.getCurrentWindow().close();
    },

    async handleStage() {
      await settings.set('shownTutorial', true);
      if (
        this.currentStage ===
        this.availableStages[this.selectedLanguage].length - 1
      ) {
        this.currentStage = -1;
        this.$store.commit('setTutorialState', false);
      } else {
        this.currentStage += 1;
      }
    },
    goBack() {
      this.currentStage -= 1;
    },
  },
};
</script>

<style scoped lang="scss">
b {
  padding: 5px 15px;
  margin-left: 5px;
  font-weight: 900;
  letter-spacing: 1.5px;
  border-radius: 3rem;
  background: rgba(255 255 255 / 0.15);
  color: white;
}

#tutorial-container {
  position: fixed;
  display: flex;
  flex-direction: column;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 18;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  background-color: #131313;
  backdrop-filter: blur(0.5rem);
  text-align: center;
  animation: scale_down 0.5s ease;
}

.tutorial-footer {
  padding: 20px;
  position: absolute;
  font-weight: 400;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  color: #cbcbcb;
  background-size: cover;
  text-shadow: var(--text-shadow);
  font-size: 0.95rem;
  line-height: 1.3;
  border-top-left-radius: 1.5rem;
  border-top-right-radius: 1.5rem;
}

.tutorial-content {
  display: flex;
  width: 100%;
  padding: 100%;
  height: auto;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.tutorial-items {
  display: flex;
  padding: 20px;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  justify-content: center;
  text-align: center;
  width: 900px;
  height: 600px;
  margin-bottom: 150px;
  transition: 0.5s ease;
}

.tutorial-items p {
  width: 100%;
  font-weight: 400;
  color: #b5b5b5;
  text-shadow: 0px 1px 0px rgb(0 0 0 / 50%);
}

.tutorial-image {
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

.tutorial-controls {
  display: flex;
  height: 50px;
  width: 500px;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
}

.tutorial-items button {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5rem;
  border: none;
  background: #3281a3;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  text-shadow: 0px 1px 0px rgb(0 0 0 / 25%);
  transition: 0.5s ease;
}

.tutorial-items button:hover {
  background: #3695be;
  box-shadow: 0 0 0 2px #3b96be40;
}

#tutorial-change-stage {
  position: absolute;
  right: 0;
}
.tutorial-stages {
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  height: 20px;
}

.tutorial-stages span {
  width: 10px;
  height: 10px;
  border-radius: 1rem;
  background-color: #cbcbcb7c;
  transition: 0.25s ease;
}

span.tutorial-stage-active {
  background-color: #ffffff;
  box-shadow: 0 0 0 2px #ffffff39;
}

.tutorial-content h1 {
  font-weight: 600;
  letter-spacing: -1.25px;
  width: 500px;
  font-size: 2.5rem;
}

.titlebar-button {
  position: absolute;
  top: 0;
  right: 0;
  margin: 30px 35px;
  -webkit-app-region: no-drag;
  background: rgba(255, 255, 255, 0.05);
  width: 40px;
  height: 40px;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.5s ease-out, box-shadow 0.5s ease;
}

.titlebar-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.titlebar-button-icon {
  font-size: 17px;
  filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.3));
}

select#language-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3281a3;
  box-shadow: 0 0 0 2px #3b96be40;
  border: none;
  padding: 10px 30px;
  border-radius: 999px;
  font-size: 1.1em;
  outline: none;
  margin-bottom: -20px;
  margin-top: 20px;
  text-shadow: 0px 1px 0px rgb(0 0 0 / 25%);
  cursor: pointer;

  option {
    border: none;
    outline: none;
  }

  &:focus {
    background: #3695be;
    box-shadow: 0 0 0 2px #3b96be40;
  }
}
#language-selector-done {
  position: absolute;
  right: 42.5%;
}
</style>

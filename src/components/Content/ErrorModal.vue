<template>
    <div id="modal-container" v-if="$store.state.showModal">
        <div id="modal-form">
            <h2 id="modal-form-title">An error occured</h2>
            <div id="modal-content">
                <code>{{ $store.state.errorMessage }}</code>
            </div>
            <div id="modal-actions">
                <button class="button" id="button-close" @click="
    $store.state.showModal = !$store.state.showModal
                ">
                    Close
                </button>
                <button class="button" id="button-copy" @click="copyToClipboard($store.state.errorMessage)">
                    Copy Error
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Modal',
    methods: {
        copyToClipboard(text) {
            navigator.clipboard.writeText(text);
        },
    },
}
</script>

<style scoped>
#modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin-top: 110px;
    z-index: 1;
    overflow: hidden;
    background-color: #000000cc;
    text-align: center;
}

#modal-form {
    position: fixed;
    background: linear-gradient(to top, #0e0e0ebd, #151515),
        url('../.././assets/cards-backgrounds/settings-1.png');
    background-size: cover;
    background-position: center;
    border: 2px #1f1f1f solid;
    height: fit-content;
    padding: 25px;
    z-index: 100;
    width: 60%;
    left: calc((50vw - 50%) * -1);
    top: calc((50vh - 50%) * -1);
    transform: translate(calc(50vw - 50%), calc(50vh - 50%));
    border-radius: 15px;
    justify-content: center;
}

#modal-form-title {
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 600;
    text-shadow: 0 2px 0 rgba(0, 0, 0, 0.5);
    margin-bottom: 15px;
}

#modal-content {
    background-color: #121212;
    border-radius: 8px;
    padding: 10px;
    text-align: left;
    margin-bottom: 15px;
}

code {
    font-family: consolas, monospace;
    user-select: text;
    white-space: pre;
    white-space: pre-wrap;
}

.button {
    background-color: #1f1f1f;
    width: 150px;
    height: 40px;
    border: none;
    border-radius: 3px;
    text-shadow: 0 1px 0 #000000cc;
    font-size: 18px;
    cursor: pointer;
}

#modal-actions {
    display: flex;
    justify-content: space-between;
}

#button-close {
    float: left;
    background-color: #a22143;
}

#button-copy {
    float: right;
    background-color: #2b71ce;
}

#button-close:hover {
    background-color: #7e1934;
}

#button-copy:hover {
    background-color: #0b51ae;
}
</style>

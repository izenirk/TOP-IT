<template>
    <div v-if="visible" class="modal" @click.self="close">
        <div class="modal-content">
            <span class="close" @click="close">&times;</span>
            <h3>Подтверждение удаления</h3>
            <p>{{ message }}</p>
            <div class="modal-buttons">
                <button class="cancel-btn" @click="close">Отмена</button>
                <button class="confirm-btn" @click="confirm">Удалить</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DeleteModal',
    props: {
        visible: Boolean,
        message: String,
        onConfirm: Function
    },
    methods: {
        close() {
            this.$emit('close');
        },
        confirm() {
            if (this.onConfirm) {
                this.onConfirm();
            }
            this.close();
        }
    }
}
</script>

<style scoped>
.modal {
    position: fixed;
    z-index: 2000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background-color: #fefefe;
    padding: 20px;
    border: 1px solid #888;
    width: 400px;
    max-width: 90%;
    border-radius: 5px;
    position: relative;
}

.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    position: absolute;
    right: 15px;
    top: 10px;
}

.close:hover {
    color: black;
}

.modal-buttons {
    margin-top: 20px;
    text-align: right;
}

.modal-buttons button {
    padding: 8px 16px;
    margin-left: 10px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

.confirm-btn {
    background-color: #f44336;
    color: white;
}

.cancel-btn {
    background-color: #ccc;
}
</style>
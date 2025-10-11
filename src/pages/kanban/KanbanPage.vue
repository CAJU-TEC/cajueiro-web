<template>
  <q-page>
    <KanbanHeader title="Painel de Projetos" @add-column="addColumn" @clear-all="clearAllColumns" />

    <div class="bg-gradient flex flex-center q-pa-md" style="margin-top: -4%;">
      <div class="kanban-board row no-wrap q-gutter-md">

        <!-- Colunas do Kanban -->
        <div v-for="(column, colIndex) in columns" :key="column.id" class="kanban-column q-pa-sm column-shadow">
          <q-card flat bordered class="full-height" >

            <!-- Cabeçalho da Coluna -->
            <q-card-section class="bg-primary text-white q-pa-sm row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold">{{ column.title }}</div>
              <q-btn
                v-if="columns.length > 1"
                flat round dense size="sm"
                icon="delete_outline"
                color="white"
                @click="confirmRemoveColumn(colIndex)"
                aria-label="Remover coluna"
              />
            </q-card-section>

            <q-separator />

            <!-- Cards -->
            <q-scroll-area style="height: 70vh; ">
              <draggable
                v-model="column.tasks"
                group="tasks"
                item-key="id"
                class="q-pa-sm"
                handle=".drag-handle"
                @start="onDragStart"
                @end="onDragEnd"
              >
                <template #item="{ element, index }">
                  <q-card
                    bordered
                    flat
                    class="q-mb-sm q-pa-sm bg-grey-2 cursor-grab hover-card"
                    :class="{ 'dragging': draggingTask === element.id }"
                  >
                    <div class="row items-center justify-between">
                      <div class="text-body2 text-weight-medium drag-handle" style="color: #BFBFBF;">
                        {{ element.title }}
                      </div>
                      <q-btn
                        flat dense round size="sm"
                        icon="close"
                        color="negative"
                        @click="confirmRemoveTask(colIndex, index)"
                        aria-label="Remover tarefa"
                      />
                    </div>

                    <div v-if="element.dueDate" class="text-caption text-grey q-mt-xs">
                      <q-icon name="event_note" size="16px" class="q-mr-xs" />
                      {{ element.dueDate }}
                    </div>
                  </q-card>
                </template>
              </draggable>

              <!-- Placeholder se vazio -->
              <div v-if="column.tasks.length === 0" class="text-center text-grey q-pa-lg">
                <q-icon name="assignment_turned_in" size="48px" class="q-mb-sm" />
                <div>Nenhuma tarefa aqui ainda 😊</div>
                <q-btn
                  flat
                  dense
                  icon="add_circle_outline"
                  label="Adicionar cartão"
                  color="primary"
                  class="q-mt-sm"
                  @click="addTask(colIndex)"
                />
              </div>
            </q-scroll-area>

            <q-separator />

            <!-- Ações da coluna -->
            <q-card-actions align="center">
              <q-btn
                flat
                dense
                icon="add_circle_outline"
                label="Adicionar cartão"
                color="primary"
                @click="addTask(colIndex)"
                class="full-width"
              />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Botão para adicionar nova coluna - agora dentro do board -->
        <div class="col-auto flex flex-center">
          <q-btn
            outline
            color="white"
            icon="add"
            label="Nova Coluna"
            class="q-px-md text-white"
            @click="addColumn"
            style="min-width: 280px;"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import draggable from 'vuedraggable';
import KanbanHeader from '../../components/kanban/KanbanHeader.vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

// Estado de arraste
const draggingTask = ref(null);

// Estrutura base
const columns = ref([
  {
    id: 1,
    title: 'Recursos para Projetos',
    tasks: [
      { id: 1, title: 'Criar wireframe do index', dueDate: '10 out 2025' },
      { id: 2, title: 'Definir paleta de cores' },
    ],
  },
  {
    id: 2,
    title: 'Perguntas para Reunião',
    tasks: [
      { id: 3, title: 'Quem revisa UI/UX?' },
      { id: 4, title: 'Status do deploy do staging?' },
    ],
  },
  {
    id: 3,
    title: 'A Fazer',
    tasks: [
      { id: 5, title: 'Criar rascunho de banner', dueDate: '20 out 2025' },
      { id: 6, title: 'Editar textos de onboarding' },
    ],
  },
]);

// 🟩 Adicionar nova coluna
function addColumn() {
  const newCol = {
    id: Date.now(),
    title: `Nova Coluna ${columns.value.length + 1}`,
    tasks: [],
  };
  columns.value.push(newCol);
  saveToStorage();
}

// 🟥 Remover coluna (com confirmação)
function confirmRemoveColumn(index) {
  $q.dialog({
    title: 'Remover Coluna?',
    message: 'Isso removerá todas as tarefas dentro dela. Tem certeza?',
    cancel: true,
    persistent: false,
  }).onOk(() => {
    columns.value.splice(index, 1);
    saveToStorage();
  });
}

// 🟨 Adicionar nova task
function addTask(colIndex) {
  const newTask = {
    id: Date.now(),
    title: 'Novo cartão...',
  };
  columns.value[colIndex].tasks.push(newTask);
  saveToStorage();
}

// 🟦 Remover task (com confirmação)
function confirmRemoveTask(colIndex, taskIndex) {
  $q.dialog({
    title: 'Remover Tarefa?',
    message: 'Tem certeza que deseja remover esta tarefa?',
    cancel: true,
    persistent: false,
  }).onOk(() => {
    columns.value[colIndex].tasks.splice(taskIndex, 1);
    saveToStorage();
  });
}

// 🔄 Limpar tudo
function clearAllColumns() {
  $q.dialog({
    title: 'Limpar Tudo?',
    message: 'Isso removerá todas as colunas e tarefas. Não será possível desfazer.',
    cancel: true,
    persistent: false,
  }).onOk(() => {
    columns.value = [];
    saveToStorage();
  });
}

// 📦 Persistência no localStorage
function saveToStorage() {
  localStorage.setItem('kanban-columns', JSON.stringify(columns.value));
}

function loadFromStorage() {
  const saved = localStorage.getItem('kanban-columns');
  if (saved) {
    try {
      columns.value = JSON.parse(saved);
    } catch (e) {
      console.warn('Falha ao carregar dados do localStorage');
    }
  }
}

// 🚀 Inicialização
onMounted(() => {
  loadFromStorage();
});

// 🎭 Efeitos de arraste
function onDragStart(event) {
  draggingTask.value = event.item.dataset.id;
}

function onDragEnd() {
  draggingTask.value = null;
  saveToStorage();
}
</script>
<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #3f51b5, #9c27b0);
  min-height: 100vh;
  color: white;
}

.kanban-board {
  overflow-x: auto;
  width: 100%;
  height: 100%;
}

.kanban-column {
  min-width: 280px;
  max-width: 320px;
  flex: 0 0 auto;
}

.column-shadow {
  border-radius: 10px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.hover-card:hover {
  transform: translateY(-2px);
  transition: all 0.2s ease;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.dragging {
  opacity: 0.7;
  transform: scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.full-height {
  height: 100%;
}

.q-scrollarea__container {
  padding-right: 4px;
}

/* Cursor personalizado */
.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

/* Botão "Nova Coluna" estilizado */
.q-btn--outline.q-btn--text-color-white {
  border-color: rgba(255, 255, 255, 0.5);
}

.q-btn--outline.q-btn--text-color-white:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>

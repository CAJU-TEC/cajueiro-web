<template>
  <q-page padding>
    <div class="row items-center q-mb-md q-col-gutter-sm">
      <div class="col-12 col-md">
        <q-breadcrumbs class="q-mb-xs">
          <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
          <q-breadcrumbs-el label="Atualizar bancos" />
        </q-breadcrumbs>
        <div class="text-h5 text-weight-medium">Atualizar bases de teste</div>
        <div class="text-caption text-grey-7">
          Copia o banco de produção da organização para Desenvolvimento ou Homologação.
        </div>
      </div>
      <div class="col-12 col-md-auto row q-gutter-sm items-center">
        <q-input
          v-model="busca"
          dense
          outlined
          clearable
          placeholder="Buscar organização"
          style="min-width: 220px"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-btn outline color="primary" icon="history" label="Histórico" :to="{ name: 'apps.historico' }" />
        <q-btn unelevated color="negative" icon="sync" label="Atualizar todos" :disable="loading" @click="openTodos" />
        <q-btn
          v-if="emAndamento"
          outline
          color="negative"
          icon="close"
          :label="`Cancelar todos (${emAndamento})`"
          @click="cancelarTodos"
        />
      </div>
    </div>

    <q-inner-loading :showing="loading" />

    <div v-if="!loading && !filtrados.length" class="column items-center text-grey-6 q-pa-xl">
      <q-icon name="storage" size="64px" />
      <div class="q-mt-sm">Nenhuma organização ativa com banco cadastrado.</div>
    </div>

    <q-card v-for="secao in secoes" :key="secao.nome" bordered class="q-mb-lg">
      <q-card-section v-if="secoes.length > 1" class="row items-center q-pb-none">
        <div class="text-h6 text-weight-medium">{{ secao.nome }}</div>
        <q-badge color="primary" class="q-ml-sm" :label="secao.itens.length" />
      </q-card-section>
      <q-card-section>
      <div class="row q-col-gutter-md">
      <div v-for="app in secao.itens" :key="app.id" class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <q-card bordered class="full-height">
          <q-card-section class="bg-primary text-white row items-center no-wrap q-py-sm">
            <q-icon name="location_city" size="28px" />
            <div class="q-ml-sm ellipsis text-subtitle1 text-weight-medium">{{ app.nome }}</div>
            <q-space />
            <q-btn flat round dense icon="history" @click="openHistorico(app)">
              <q-tooltip>Histórico</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" :to="{ name: 'corporates.form', params: { id: app.id } }">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
          </q-card-section>

          <q-card-section class="q-gutter-y-sm">
            <div
              v-for="amb in ambientes"
              :key="amb.value"
              :class="`bg-${amb.color}-1 rounded-borders q-pa-sm`"
            >
              <div class="row items-center no-wrap">
                <q-badge :color="amb.color" :label="amb.label" class="text-subtitle2 q-px-sm" />
                <div class="q-ml-sm ellipsis text-body2 text-weight-medium">
                  {{ app['banco_' + amb.value] || 'cadastro incompleto' }}
                </div>
                <q-space />
                <q-btn
                  v-if="estado[chave(app, amb.value)]"
                  round
                  unelevated
                  size="sm"
                  icon="close"
                  color="negative"
                  @click="cancelar(app, amb)"
                >
                  <q-tooltip>Cancelar atualização</q-tooltip>
                </q-btn>
                <q-btn
                  v-else
                  round
                  unelevated
                  size="sm"
                  icon="sync"
                  :color="amb.color"
                  @click="openConfirm(app, amb)"
                >
                  <q-tooltip>Atualizar {{ amb.label }}</q-tooltip>
                </q-btn>
              </div>

              <div class="text-caption text-grey-8 q-mt-xs row items-center">
                <template v-if="estado[chave(app, amb.value)]">
                  {{ textoAndamento(app, amb) }}
                </template>
                <template v-else-if="app.ultimo?.[amb.value]">
                  <q-icon
                    class="q-mr-xs"
                    size="16px"
                    :name="app.ultimo[amb.value].status === 'concluido' ? 'check_circle' : 'error'"
                    :color="app.ultimo[amb.value].status === 'concluido' ? 'positive' : 'negative'"
                  />
                  {{ app.ultimo[amb.value].status === 'concluido' ? 'Atualizado' : 'Falhou' }}
                  em {{ app.ultimo[amb.value].finished_at }}
                </template>
                <template v-else>
                  <q-icon class="q-mr-xs" size="16px" name="schedule" />
                  Nunca atualizado
                </template>
              </div>

              <q-linear-progress
                v-if="estado[chave(app, amb.value)]"
                class="q-mt-xs"
                rounded
                :indeterminate="info[chave(app, amb.value)]?.percentual == null"
                :value="(info[chave(app, amb.value)]?.percentual || 0) / 100"
                :color="amb.color"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
      </div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="historico.show">
      <q-card style="min-width: 460px; max-width: 95vw">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="history" size="28px" color="primary" />
          <div class="text-h6 q-ml-sm">Histórico · {{ historico.app?.nome }}</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-sm">
          <q-inner-loading :showing="historico.loading" />
          <div v-if="!historico.loading && !historico.itens.length" class="text-center text-grey-6 q-pa-md">
            Nenhuma atualização registrada.
          </div>
          <q-list separator>
            <q-item v-for="h in historico.itens" :key="h.id">
              <q-item-section avatar>
                <q-icon
                  :name="icones[h.status]"
                  :color="cores[h.status]"
                  size="28px"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  <q-badge
                    :color="h.destino === 'dev' ? 'teal' : 'orange'"
                    :label="h.destino?.toUpperCase()"
                  />
                  <span class="q-ml-sm text-body2">{{ rotulos[h.status] }}</span>
                </q-item-label>
                <q-item-label caption>
                  {{ h.user?.name }} · {{ h.started_at }} → {{ h.finished_at || '...' }}
                </q-item-label>
                <q-item-label v-if="h.erro" caption class="text-negative">{{ h.erro }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirm.show" persistent>
      <q-card style="min-width: 440px; max-width: 95vw">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="warning" color="negative" size="28px" />
          <div class="text-h6 q-ml-sm">Substituir dados de {{ confirm.amb?.label }}?</div>
        </q-card-section>

        <q-card-section>
          <div class="row items-center justify-center q-gutter-md q-pa-md bg-grey-2 rounded-borders">
            <div class="text-center">
              <q-badge color="grey-8" label="PRODUÇÃO" />
              <div class="text-caption q-mt-xs">{{ confirm.app?.banco_prod }}</div>
            </div>
            <q-icon name="arrow_forward" size="28px" color="grey-7" />
            <div class="text-center">
              <q-badge :color="confirm.amb?.color" :label="confirm.amb?.label" />
              <div class="text-caption q-mt-xs">{{ confirm.app?.['banco_' + confirm.amb?.value] }}</div>
            </div>
          </div>

          <div class="q-mt-md text-body2">
            Todos os dados atuais de
            <b>{{ confirm.app?.['banco_' + confirm.amb?.value] }}</b>
            serão <b class="text-negative">apagados</b> e substituídos pela cópia de produção.
            Não pode ser desfeito e pode levar bastante tempo.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn
            unelevated
            no-caps
            color="negative"
            icon="sync"
            label="Apagar e atualizar"
            @click="confirmOk"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="todos.show" persistent>
      <q-card style="width: 900px; max-width: 95vw">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="warning" color="negative" size="28px" />
          <div class="text-h6 q-ml-sm">Atualizar todas as organizações?</div>
        </q-card-section>

        <q-card-section>
          <div class="row items-center q-gutter-sm">
            <span class="text-body2">Destino:</span>
            <q-checkbox
              v-for="amb in ambientes"
              :key="amb.value"
              v-model="todos.destinos"
              :val="amb.value"
              :label="amb.label"
              :color="amb.color"
            />
          </div>

          <div class="q-mt-sm text-body2">
            <b>{{ aptas.length }}</b> atualizações vão para a fila e rodam uma de cada vez.
            Os dados atuais de cada destino serão <b class="text-negative">apagados</b> e substituídos pela cópia de
            produção. Não pode ser desfeito e pode levar várias horas.
          </div>

          <div class="row q-col-gutter-md q-mt-xs">
            <div v-for="lado in ladosTodos" :key="lado.titulo" class="col-12 col-sm-6">
              <q-card flat bordered>
                <q-card-section class="row items-center q-py-sm" :class="lado.classe">
                  <q-icon :name="lado.icone" size="20px" />
                  <div class="q-ml-sm text-subtitle2">{{ lado.titulo }}</div>
                  <q-space />
                  <q-badge :color="lado.cor" :label="lado.total" />
                </q-card-section>
                <q-separator />
                <q-scroll-area style="height: 320px">
                  <q-list dense separator>
                    <q-item v-for="org in lado.orgs" :key="org.app.id">
                      <q-item-section>
                        <q-item-label class="text-body2">{{ org.app.nome }}</q-item-label>
                        <q-item-label v-if="org.motivo" caption>{{ org.motivo }}</q-item-label>
                      </q-item-section>
                      <q-item-section side class="row no-wrap q-gutter-xs">
                        <q-badge v-for="amb in org.ambs" :key="amb.value" :color="amb.color" :label="amb.label" />
                      </q-item-section>
                    </q-item>
                    <q-item v-if="!lado.orgs.length">
                      <q-item-section class="text-grey-6 text-caption">Nenhuma</q-item-section>
                    </q-item>
                  </q-list>
                </q-scroll-area>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Cancelar" v-close-popup />
          <q-btn
            unelevated
            no-caps
            color="negative"
            icon="sync"
            label="Apagar e atualizar todos"
            :disable="!aptas.length"
            :loading="todos.enviando"
            @click="todosOk"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, shallowRef, computed, onMounted, onBeforeUnmount } from 'vue';
import dumpsService from 'src/services/dumps';
import { useQuasar } from 'quasar';

const POLL_INTERVAL_MS = 5000;

export default defineComponent({
  name: 'AppsListPage',
  setup() {
    const $q = useQuasar();
    const { list: listDumps, organizacoes, post: postDump, cancel: cancelDump } = dumpsService();

    const apps = shallowRef([]); // shallow: a lista só é trocada inteira, não precisa observar cada campo
    const loading = ref(true);
    const busca = ref('');
    const estado = ref({});
    const dumpIds = {}; // chave organização:destino -> id do dump em andamento
    const info = ref({}); // chave -> { percentual, bytes_copiados, bytes_estimados, iniciado_em }
    const agora = ref(Date.now()); // atualizado a cada consulta, para o tempo decorrido andar
    let timer = null;
    let desmontado = false;
    const confirm = ref({ show: false, app: null, amb: null });
    const todos = ref({ show: false, destinos: ['dev'], enviando: false });
    const historico = ref({ show: false, app: null, itens: [], loading: false });

    const ambientes = [
      { value: 'dev', label: 'DEV', color: 'ambdev' },
      { value: 'hmg', label: 'HMG', color: 'ambhmg' },
    ];
    const rotulosStatus = {
      pendente: 'Pendente',
      executando: 'Em execução',
      concluido: 'Concluído',
      falha: 'Erro',
    };
    const icones = { pendente: 'schedule', executando: 'autorenew', concluido: 'check_circle', falha: 'error' };
    const cores = { pendente: 'grey', executando: 'primary', concluido: 'positive', falha: 'negative' };
    const rotulos = {
      pendente: 'Na fila...',
      executando: 'Copiando dados...',
    };

    const chave = (app, destino) => `${app.id}:${destino}`;

    const filtrados = computed(() => {
      const termo = (busca.value || '').trim().toLowerCase();
      return apps.value.filter((a) => a.nome.toLowerCase().includes(termo));
    });

    // Uma seção por grupo (ex.: estado), em ordem alfabética; as organizações sem grupo ficam por último.
    const secoes = computed(() => {
      const porGrupo = {};
      filtrados.value.forEach((a) => {
        const nome = a.group?.nome || 'Sem grupo';
        (porGrupo[nome] = porGrupo[nome] || []).push(a);
      });

      return Object.keys(porGrupo)
        .sort((a, b) => (a === 'Sem grupo') - (b === 'Sem grupo') || a.localeCompare(b))
        .map((nome) => ({ nome, itens: porGrupo[nome] }));
    });

    const notifyError = (message, error) => {
      $q.notify({ icon: 'block', message, caption: error.message, color: 'negative' });
    };

    // Uma consulta só, para todas as organizações, a cada 5 s. Antes era uma consulta por atualização
    // a cada 2 s: com várias na fila, estourava o limite de requisições da API (429 Too Many Attempts).
    const sincronizar = async () => {
      const novas = await organizacoes();
      agora.value = Date.now();
      let terminou = false;

      novas.forEach((app) => {
        ambientes.forEach((amb) => {
          const k = chave(app, amb.value);
          const dump = app.andamento?.[amb.value];

          if (dump) {
            estado.value[k] = rotulos[dump.status];
            // só troca se mudou: cada troca redesenha a tela
            if (JSON.stringify(info.value[k]) !== JSON.stringify(dump)) info.value[k] = dump;
            dumpIds[k] = dump.id;
            return;
          }

          // Estava em andamento e não está mais: terminou (ou foi cancelada).
          if (dumpIds[k]) {
            delete estado.value[k];
            delete info.value[k];
            delete dumpIds[k];
            terminou = true;

            const fim = app.ultimo?.[amb.value];
            const ok = fim?.status === 'concluido';
            $q.notify({
              icon: ok ? 'check' : 'block',
              color: ok ? 'positive' : 'negative',
              message: ok
                ? `${amb.label} de "${app.nome}" atualizado`
                : `Atualização de ${amb.label} de "${app.nome}" falhou`,
              caption: ok ? undefined : fim?.erro,
            });
          }
        });
      });

      // A lista (cards, "Atualizado em ...") só muda quando algo termina; trocar a cada 5 s redesenhava tudo.
      if (terminou || !apps.value.length) apps.value = novas;
    };

    // setTimeout encadeado: a próxima consulta só sai depois que a anterior terminou.
    // Só consulta enquanto há atualização em andamento; sem nada rodando, a tela fica parada.
    const agendar = () => {
      if (timer || desmontado || !Object.keys(dumpIds).length) return;
      timer = setTimeout(async () => {
        try {
          await sincronizar();
        } catch (error) {
          // falha pontual de rede: tenta de novo na próxima volta
        }
        timer = null;
        agendar();
      }, POLL_INTERVAL_MS);
    };

    onMounted(async () => {
      try {
        await sincronizar();
      } catch (error) {
        notifyError('Ops! Ocorreu um erro.', error);
      } finally {
        loading.value = false;
      }
      agendar();
    });

    onBeforeUnmount(() => {
      desmontado = true;
      clearTimeout(timer);
    });

    const openHistorico = async (app) => {
      historico.value = { show: true, app, itens: [], loading: true };
      try {
        historico.value.itens = await listDumps(app.id);
      } catch (error) {
        notifyError('Não foi possível carregar o histórico.', error);
      } finally {
        historico.value.loading = false;
      }
    };

    const formatarBytes = (b) => (b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB` : `${Math.round(b / 1e6)} MB`);

    const formatarTempo = (ms) => {
      const min = Math.floor(ms / 60000);
      if (min < 1) return 'menos de 1 min';
      if (min < 60) return `${min} min`;
      return `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;
    };

    // Ex.: "Copiando dados... · 1.2 GB copiados · 35% · há 12 min · ~22 min restantes"
    // O percentual conta as tabelas já copiadas (pelo tamanho delas); o tempo restante é aproximado.
    const textoAndamento = (app, amb) => {
      const k = chave(app, amb.value);
      const i = info.value[k] || {};
      const partes = [estado.value[k]];

      if (i.bytes_copiados) partes.push(`${formatarBytes(i.bytes_copiados)} copiados`);
      if (i.percentual != null) partes.push(`${i.percentual}%`);
      if (i.iniciado_em) {
        const decorrido = agora.value - new Date(i.iniciado_em).getTime();
        partes.push(`há ${formatarTempo(decorrido)}`);
        if (i.percentual >= 5 && i.percentual < 99) {
          partes.push(`~${formatarTempo((decorrido * (100 - i.percentual)) / i.percentual)} restantes`);
        }
      }

      return partes.join(' · ');
    };

    const cancelar = (app, amb) => {
      $q.dialog({
        title: 'Cancelar atualização',
        message: `Marcar a atualização de ${amb.label} de "${app.nome}" como cancelada? `
          + 'Se a cópia já começou, ela é interrompida e o banco de destino fica incompleto.',
        cancel: { label: 'Voltar', flat: true },
        ok: { label: 'Cancelar atualização', color: 'negative' },
        persistent: true,
      }).onOk(async () => {
        try {
          await cancelDump(dumpIds[chave(app, amb.value)]);
        } catch (error) {
          notifyError('Não foi possível cancelar.', error);
        }
      });
    };

    const emAndamento = computed(() => Object.keys(estado.value).length);

    // Um POST de cancelamento por atualização pendente ou em execução; o polling tira os cards do andamento.
    const cancelarTodos = () => {
      $q.dialog({
        title: 'Cancelar todas as atualizações',
        message: `Cancelar as ${emAndamento.value} atualizações na fila ou em execução? `
          + 'As que já começaram são interrompidas e o banco de destino delas fica incompleto.',
        cancel: { label: 'Voltar', flat: true },
        ok: { label: 'Cancelar todas', color: 'negative' },
        persistent: true,
      }).onOk(async () => {
        const falhas = [];
        for (const id of Object.values(dumpIds)) {
          try {
            await cancelDump(id);
          } catch (error) {
            falhas.push(error.message);
          }
        }
        if (falhas.length) {
          $q.notify({
            icon: 'block',
            color: 'negative',
            message: `${falhas.length} atualização(ões) não foram canceladas`,
            caption: falhas.join(' | '),
          });
        } else {
          $q.notify({ icon: 'check', color: 'positive', message: 'Atualizações canceladas' });
        }
      });
    };

    const openConfirm = (app, amb) => {
      confirm.value = { show: true, app, amb };
    };

    const confirmOk = async () => {
      const { app, amb } = confirm.value;
      confirm.value.show = false;
      const k = chave(app, amb.value);
      try {
        const dump = await postDump({ corporate_id: app.id, destino: amb.value });
        estado.value[k] = rotulos.pendente;
        dumpIds[k] = dump.id;
        agendar();
      } catch (error) {
        notifyError('Não foi possível iniciar a atualização.', error);
      }
    };

    // Atualizar todos: separa, para cada destino marcado, quem entra na fila e quem fica de fora (e por quê).
    const candidatos = computed(() => apps.value.flatMap((app) => ambientes
      .filter((amb) => todos.value.destinos.includes(amb.value))
      .map((amb) => {
        const k = chave(app, amb.value);
        let motivo = null;
        if (!app.host_prod || !app.banco_prod || !app[`host_${amb.value}`] || !app[`banco_${amb.value}`]) {
          motivo = 'cadastro incompleto';
        } else if (estado.value[k]) {
          motivo = 'já está na fila';
        }
        return { chave: k, app, amb, motivo };
      })));
    const aptas = computed(() => candidatos.value.filter((c) => !c.motivo));
    const foraDaFila = computed(() => candidatos.value.filter((c) => c.motivo));

    // Uma linha por organização (com os destinos dela), em vez de uma por organização+destino.
    const agruparPorOrganizacao = (itens) => {
      const porApp = new Map();
      itens.forEach(({ app, amb, motivo }) => {
        const org = porApp.get(app.id) || { app, ambs: [], motivos: new Set() };
        org.ambs.push(amb);
        if (motivo) org.motivos.add(`${amb.label}: ${motivo}`);
        porApp.set(app.id, org);
      });
      return [...porApp.values()].map((o) => ({ ...o, motivo: [...o.motivos].join(' · ') }));
    };

    const ladosTodos = computed(() => [
      {
        titulo: 'Vão para a fila',
        icone: 'check_circle',
        classe: 'text-positive',
        cor: 'positive',
        total: aptas.value.length,
        orgs: agruparPorOrganizacao(aptas.value),
      },
      {
        titulo: 'Ficam de fora',
        icone: 'block',
        classe: 'text-grey-8',
        cor: 'grey-7',
        total: foraDaFila.value.length,
        orgs: agruparPorOrganizacao(foraDaFila.value),
      },
    ]);

    const openTodos = () => {
      todos.value = { show: true, destinos: ['dev'], enviando: false };
    };

    // Um POST por organização, em sequência (a fila fica na mesma ordem da tela); uma falha não para as outras.
    const todosOk = async () => {
      todos.value.enviando = true;
      const falhas = [];

      for (const { app, amb, chave: k } of aptas.value.slice()) {
        try {
          const dump = await postDump({ corporate_id: app.id, destino: amb.value });
          estado.value[k] = rotulos.pendente;
          dumpIds[k] = dump.id;
        } catch (error) {
          falhas.push(`${amb.label} ${app.nome}: ${error.message}`);
        }
      }

      todos.value.show = false;
      agendar();

      if (falhas.length) {
        $q.notify({
          icon: 'block',
          color: 'negative',
          message: `${falhas.length} atualização(ões) não entraram na fila`,
          caption: falhas.join(' | '),
          timeout: 0,
          actions: [{ icon: 'close', color: 'white' }],
        });
      } else {
        $q.notify({ icon: 'check', color: 'positive', message: 'Atualizações enviadas para a fila' });
      }
    };

    return {
      busca,
      todos,
      aptas,
      ladosTodos,
      openTodos,
      emAndamento,
      cancelarTodos,
      todosOk,
      loading,
      filtrados,
      secoes,
      ambientes,
      estado,
      info,
      textoAndamento,
      chave,
      confirm,
      historico,
      openHistorico,
      icones,
      cores,
      rotulos: rotulosStatus,
      openConfirm,
      confirmOk,
      cancelar,
    };
  },
});
</script>

<style>
/* Cores dos ambientes: o Quasar monta as classes bg-/text- a partir do nome passado em "color". */
.bg-ambdev { background: #a5041f !important; }
.text-ambdev { color: #a5041f !important; }
.bg-ambdev-1 { background: rgba(165, 4, 31, 0.08); }
.bg-ambhmg { background: #5637e0 !important; }
.text-ambhmg { color: #5637e0 !important; }
.bg-ambhmg-1 { background: rgba(86, 55, 224, 0.08); }
</style>

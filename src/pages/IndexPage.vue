<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" />
      </q-breadcrumbs>
      <h2 class="pt-10">Galerinha em atividades!</h2>
      <div class="row q-col-gutter-sm">
        <div class="col" v-for="item in [0, 1, 2]" :key="item">
          <q-card flat bordered>
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>Title</q-item-label>
                <q-item-label caption> Subhead </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />

            <q-card-section horizontal>
              <q-card-section> lorem </q-card-section>

              <q-separator vertical />

              <q-card-section class="col-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </q-card-section>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script></script>

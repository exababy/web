<template>
  <div class="skins-admin">
    <div class="skins-admin__content">
      <!-- Server table -->
      <div class="skins-admin__servers">
        <button class="skins-admin__btn skins-admin__btn--add" @click="showAddServer = true">
          Add Server
        </button>

        <table class="skins-admin__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>IP:PORT</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="server in servers" :key="server.id">
              <td>{{ server.id }}</td>
              <td>{{ server.name }}</td>
              <td>{{ server.ip_address }}:{{ server.port }}</td>
              <td>
                <button
                  class="skins-admin__delete"
                  @click="deleteServer(server.id)"
                >
                  ✕
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Update buttons -->
      <div class="skins-admin__updates">
        <button
          v-for="btn in updateButtons"
          :key="btn.type"
          class="skins-admin__btn"
          :disabled="updating === btn.type"
          @click="updateData(btn.type)"
        >
          {{ updating === btn.type ? "Updating..." : btn.label }}
        </button>
      </div>
    </div>

    <!-- Add server form -->
    <div v-if="showAddServer" class="skins-admin__add-form">
      <div class="skins-admin__form-header">
        <h5>Add Server</h5>
        <button class="skins-admin__delete" @click="showAddServer = false">
          ✕
        </button>
      </div>
      <div class="skins-admin__form-body">
        <div class="skins-admin__field">
          <label>Server Name</label>
          <input v-model="newServer.name" type="text" />
        </div>
        <div class="skins-admin__field">
          <label>IP</label>
          <input v-model="newServer.ip" type="text" />
        </div>
        <div class="skins-admin__field">
          <label>Port</label>
          <input v-model="newServer.port" type="text" />
        </div>
        <button class="skins-admin__btn" @click="addServer">Add</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const servers = ref<any[]>([]);
const showAddServer = ref(false);
const updating = ref("");
const newServer = ref({ name: "", ip: "", port: "" });

const updateButtons = [
  { type: "skins", label: "Update Skins" },
  { type: "stickers", label: "Update Stickers" },
  { type: "keychains", label: "Update Keychains" },
  { type: "agents", label: "Update Agents" },
  { type: "coins", label: "Update Coins" },
  { type: "music", label: "Update Music" },
  { type: "all", label: "Update All" },
];

async function fetchServers() {
  try {
    const data = await $fetch("/api/skins/servers");
    servers.value = data as any[];
  } catch (e) {
    console.error("Error fetching servers:", e);
  }
}

async function addServer() {
  try {
    await $fetch("/api/skins/servers", {
      method: "POST",
      body: {
        action: "add",
        name: newServer.value.name,
        ip: newServer.value.ip,
        port: newServer.value.port,
      },
    });
    showAddServer.value = false;
    newServer.value = { name: "", ip: "", port: "" };
    await fetchServers();
  } catch (e) {
    console.error("Error adding server:", e);
  }
}

async function deleteServer(id: number) {
  try {
    await $fetch("/api/skins/servers", {
      method: "POST",
      body: { action: "delete", id },
    });
    await fetchServers();
  } catch (e) {
    console.error("Error deleting server:", e);
  }
}

async function updateData(type: string) {
  updating.value = type;
  try {
    const res = await $fetch<{ status: string; text: string }>(
      "/api/skins/update-data",
      {
        method: "POST",
        body: { type },
      }
    );
    alert(res.text);
  } catch (e) {
    console.error("Error updating data:", e);
    alert("Update failed");
  } finally {
    updating.value = "";
  }
}

onMounted(fetchServers);
</script>

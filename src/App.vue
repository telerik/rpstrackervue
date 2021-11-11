<template>
  <div>
    <MainMenu></MainMenu>

    <div class="container-fluid">
      <div class="row">
        <SideMenu></SideMenu>

        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
          <router-view/>
        </main>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SideMenu from '@/components/SideMenu.vue';
import MainMenu from '@/components/MainMenu.vue';

import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  components: {
    MainMenu,
    SideMenu,
  },
});
</script>

<style>
.feather {
    width: 16px;
    height: 16px;
    vertical-align: text-bottom;
}

/*
 * Sidebar
 */

.sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 100; /* Behind the navbar */
    padding: 67px 0 0; /* Height of navbar */
    box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.1);
}

.sidebar-sticky {
    position: relative;
    top: 0;
    height: calc(100vh - 67px);
    padding-top: 0.5rem;
    overflow-x: hidden;
    overflow-y: auto; /* Scrollable contents if viewport is shorter than content. */
}

@supports ((position: -webkit-sticky) or (position: sticky)) {
    .sidebar-sticky {
        position: -webkit-sticky;
        position: sticky;
    }
}

.sidebar .nav-link {
    font-weight: 500;
    color: #333;
}

.sidebar .nav-link .feather {
    margin-right: 4px;
    color: #999;
}

.sidebar .nav-link.active {
    color: #007bff;
}

.sidebar .nav-link:hover .feather,
.sidebar .nav-link.active .feather {
    color: inherit;
}

.sidebar-heading {
    font-size: 0.75rem;
    text-transform: uppercase;
}

/*
 * Content
 */

[role='main'] {
    padding-top: 133px; /* Space for fixed navbar */
}

@media (min-width: 768px) {
    [role='main'] {
        padding-top: 67px; /* Space for fixed navbar */
    }
}

/*
 * Navbar
 */

.navbar-brand {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    font-size: 1rem;
    background-color: rgba(0, 0, 0, 0.25);
    box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.25);
}

.navbar .form-control {
    padding: 0.75rem 1rem;
    border-width: 0;
    border-radius: 0;
}

.form-control-dark {
    color: #fff;
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
}

.form-control-dark:focus {
    border-color: transparent;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.25);
}

.li-avatar {
    background-color: #eeeeee;
    width: 40px;
    height: 40px;
}

.li-estimate {
    font-size: 10px;
    font-weight: bold;
    color: #555a97;
}

.li-date {
    font-size: 12px;
    color: #555a97;
    margin-left: 10px;
}

.indicator-pbi {
    background-color: #527fd7;
}

.indicator-bug {
    background-color: #d75252;
}

.indicator-chore {
    background-color: #666666;
}

.indicator-impediment {
    background-color: #d7c152;
}

.priority-critical {
    color: #fff;
    background-color: #820101;
}

.priority-high {
    color: #fff;
    background-color: #b27100;
}

.priority-medium {
    color: #fff;
    background-color: #0c6d00;
}

.priority-low {
    color: #fff;
    background-color: #002b6d;
}

.modal-body {
    max-height: 400px;
    overflow: scroll;
}

.logo {
    width: 100px;
}

/* modal */

.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: table;
    transition: opacity 0.3s ease;
}

.modal-wrapper {
    display: table-cell;
    vertical-align: middle;
}

.modal-container {
    width: 500px;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;
    font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
    margin-top: 0;
    color: #42b983;
}

.modal-body {
    margin: 20px 0;
}

.modal-default-button {
    float: right;
}

.modal-enter {
    opacity: 0;
}

.modal-leave-active {
    opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
}

.backlog-icon {
    height: 20px;
}
</style>

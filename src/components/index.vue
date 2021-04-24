<template>
  <div class="guardian-form">
    <el-tabs v-model="activeName">
      <el-tab-pane v-if="!isPublic" label="创分支" name="branch">
        <branch-form></branch-form>
      </el-tab-pane>
      <el-tab-pane v-if="!isPublic" label="创项目" name="project">
        <project-form></project-form>
      </el-tab-pane>
    </el-tabs>
  </div>

</template>

<script>
import branchForm from './branch-form'
import projectForm from './project-form'

export default {
  components: {
    graySwitch,
    branchForm,
    projectForm
  },
  data() {
    return {
      isPublic: PUBLIC_VERSION === 'true',
      activeName: 'branch',
    }
  },
}
</script>

<style lang="less" scoped>
.guardian /deep/ .el-select-dropdown__wrap {
  max-height: 240px;
}
.guardian /deep/ .el-cascader{
  width: 100%;
}
.guardian /deep/ .el-select-dropdown__item {
  height: auto;
}
</style>
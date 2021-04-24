<template>
  <div>
    <el-form 
        v-loading="loading" 
        ref="branchForm" 
        label-width="80px" 
        :label-position="labelAlign" 
        :model="branchForm" 
        :rules="branchRules">
        <el-form-item label="项目名称" prop="projectId">
          <el-cascader
            :options="projectList"
            @change="projectChange"
            placeholder="试试搜索项目名称：view"
            filterable>
          </el-cascader>
        </el-form-item>
        <el-form-item label="分支名" prop="branchName">
          <el-input 
            v-model="branchForm.branchName" 
            placeholder="创建的分支名"></el-input>
        </el-form-item>
        <el-form-item label="创建自">
          <el-input disabled placeholder="master"></el-input>
        </el-form-item>
        <el-button 
          type="primary" 
          @click='createBranch' 
          :disabled=branchCreateDisabled>创建</el-button>
      </el-form>
  </div>
</template>

<script>
import Service from '../static/js/getdata'

export default {
  data() {
    const validateProjectId = (rule, value, cb) => {
      if (!value) {
        cb(new Error('选择项目'));
      } else {
        cb()
      }
    }
    const validateBranchName = (rule, value, cb) => {
      if (!value) {
          this.branchCreateDisabled = true
          cb(new Error('请输入分支名'));
        } else if (!/^(release|feature|bug|custom)\/[a-zA-Z0-9\-.]+$/.test(value)) {
          this.branchCreateDisabled = true
          cb(new Error('分支名不规则：/^(release|feature|bug|custom)\\/[a-zA-Z0-9\-.]+$/'))
        }else {
          this.branchCreateDisabled = false
          cb();
        }
    }
    return {
      labelAlign: 'right',
      projectList: [],
      branchForm: {
        projectId: null,
        ref: 'master',
        branchName: null
      },
      branchRules: {
        projectId: [
          { validator: validateProjectId, required: true, trigger: 'change' }
        ],
        branchName: [
          { validator: validateBranchName, required: true, trigger: 'change' }
        ],
      },
      branchCreateDisabled: true,
      loading: true,
    }
  },
  methods: {
    initProjects() {
      // 请求自己的服务获取数据
      Service.Projects.getAll()
        .then(({data: res}) => {
          // 过滤main
          let mainPathProject = []
          let atomPathProject = []
          res.forEach(item => {

            const itemArr = item.path_with_namespace.split('/')
            if (itemArr.indexOf('main') === itemArr.length - 2) {
              item.label = item.name
              mainPathProject.push({
                value: item.id,
                label: item.name
              })
            } else if(itemArr.indexOf('atom') === itemArr.length - 2) {
              atomPathProject.push({
                value: item.id,
                label: item.name
              })
            }
          });
          this.projectList.push({
            label: "atom",
            value: "atom",
            children: JSON.parse(JSON.stringify(atomPathProject))
          }, {
            label: "main",
            value: "main",
            children: JSON.parse(JSON.stringify(mainPathProject))
          })
          this.loading = false
        }, err => {
          this.loading = false
          this.$message({
            message: `获取项目失败`,
            type: 'error'
          })
        })
    },
    createBranch() {
      this.$refs['branchForm'].validate((valid) => {
        if (valid) {
          Service.Branches.create({
            projectId: this.branchForm.projectId,
            branchName: this.branchForm.branchName,
            ref: this.branchForm.ref
          })
            .then(({data: res}) => {
              this.$message({
                message: `${res.name} 分支创建成功`,
                type: 'success'
              })
            }, (err) => {
              // gitbeaker error返回错误，后续库被修复即可
              // See https://github.com/jdalrymple/gitbeaker/issues/1146
              this.$message({
                message: `创建失败`,
                type: 'error'
              })
              console.error(err)
            })
        } else {
          console.error('表单校验不通过');
        }
      });
    },
    projectChange(obj) {
      this.branchForm.projectId = obj[1]
    },
  },
  mounted() {
    this.initProjects()
  }
}
</script>

<style lang="less" scoped>
  
</style>
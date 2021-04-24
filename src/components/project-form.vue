<template>
  <div>
    <el-form 
          v-loading="loading" 
          ref="projectForm" 
          :model="projectForm"
          label-width="80px"
          :rules="projectRules">
          <el-form-item label="所在组" prop="groupId">
            <el-select 
              v-model="projectForm.groupId" 
              placeholder="选择项目所在的组"
              filterable>
              <el-option 
                v-for="item in groupList" 
                :key="item.id" 
                :label="item.label" 
                :value="item.id">
                <el-tooltip 
                  effect="dark" 
                  placement="top"
                  :content="item.fullName" 
                  :open-delay=400>
                  <p>{{ item.label }}</p>
                </el-tooltip>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="项目名称" prop="name">
            <el-input v-model="projectForm.name" ></el-input>
          </el-form-item>
          <el-form-item label="项目描述" prop="description">
            <el-input v-model="projectForm.description" ></el-input>
          </el-form-item>
          <el-button 
            type="primary" 
            @click='createProject'>
            创建
          </el-button>
          <div v-show="showProgress" class="progress-wrapper">
            <el-progress :width="60" class="progress-bar" type="circle" :percentage="progressPercentage" :status="progressStatus"></el-progress>
            <p>{{variableText}}</p>
            <p>{{tokenText}}</p>
            <p>{{hookText}}</p>
          </div>
      </el-form>
  </div>
</template>

<script>
import Service from '../static/js/getdata'

export default {
  data() {
    const validateProjectName = (rule, value, cb) => {
      if (!value) {
        cb(new Error('请填写项目名称'));
      } else {
        cb()
      }
    }
    const validateGroupId = (rule, value, cb) => {
      if (!value) {
        cb(new Error('选择项目所在组'));
      } else {
        cb()
      }
    }
    return {
      groupList: [],
      projectRules: {
        name:  [
          { validator: validateProjectName, required: true, trigger: 'change' }
        ],
        groupId: [
          { validator: validateGroupId, required: true, trigger: 'change'}
        ]
      },
      loading: true,
      projectForm: {
        groupId: null,
        name: '',
        description: ''
      },
      projectInfo: {},
      progressPercentage: 0,
      progressStatus: null,
      variableText: '',
      tokenText: '',
      hookText: '',
      showProgress: false
    }
  },
  methods: {
    initGroups() {
      Service.Groups.getAll()
        .then(res => {
          const groups = res.data
          groups.forEach(item => {
            if (item.description.indexOf('FILEZ_SELF_SERVICE') > -1) {
              // 通过组描述的FILEZ_SELF_SERVICE字段来确认是不是可以自助创建项目
              let {full_name: fullName, id, name: label} = item
              const obj = {
                fullName,
                id,
                label,
              }
              this.groupList.push(obj)
            }
          });
          this.loading = false
        }, err => {
          this.loading = false
          this.$message({
            message: `获取组别失败`,
            type: 'error'
          })
        })
    },
    resetProgress() {
      this.progressPercentage = 0
      this.progressStatus = null
      this.variableText = ''
      this.tokenText = ''
      this.hookText = ''
      this.showProgress = false
      this.projectInfo = {}
    },
    async createProject() {
      this.resetProgress()
      this.$refs['projectForm'].validate((valid) => {
        if (valid) {
          let param = {
            name: this.projectForm.name,
            path: this.projectForm.name,
            namespace_id: this.projectForm.groupId,
            description: this.projectForm.description
          }
          Service.Projects.create(param)
            .then(async res => {
              this.projectInfo = res.data
              await this.createVariables()
              this.progressPercentage = 20
              await this.createTriggerToken()
              this.progressPercentage = 40
              let hookType = 'buildHook'
              await this.createWebHook('http://172.16.58.50:3000/hook', {
                tag_push_events: true,
                note_events: true,
                merge_requests_events: true,
                job_events: true,
                pipeline_events: true,
                repository_update_events: true,
              }, hookType)
              this.progressPercentage = 60
              hookType = 'mrHook'
              await this.createWebHook('http://172.16.58.179:7001/send/3326727c-89e5-48a5-9826-77e327fb34ce', {
                note_events: true,
                merge_requests_events: true,
              }, hookType)
              this.progressPercentage = 80
              hookType = 'tagHook'
              await this.createWebHook('http://172.16.58.179:7001/send/a2360250-4965-4484-add4-0f171b7ccaca', {
                tag_push_events: true,
              }, hookType)
              if (this.progressStatus !== 'exception') {
                this.progressStatus = 'success'
                this.hookText = 'hooks创建成功'
              }
              this.progressPercentage = 100
              this.$message({
                message: `项目创建成功，右下角若有错误提示，截图发给管理员手动创建`,
                type: 'success',
                duration: 2000,
                showClose: true
              })
            }, err => {
              this.$message({
                message: `项目创建失败，请查看是否已有同名项目`,
                type: 'error',
                duration: 0,
                showClose: true
              })
              console.error(err)
            })
        } else {
          console.error('表单校验不通过')
        }
      })
    },
    createVariables() {
      this.showProgress = true
      this.variableText = '创建变量中'
      const projectId = this.projectInfo.id
      const sshUrl = this.projectInfo.ssh_url_to_repo
      const key = 'SSH_REGISTRY_PATH'
      return Service.Projects.Variables.create({
        projectId,
        key,
        value: sshUrl
      }).then(() => {
        this.variableText = '变量创建成功'
      }, err => {
        this.$message({
          message: `变量创建失败，联系管理员`,
          type: 'error',
          duration: 0,
          showClose: true
        })
        this.variableText = '变量创建失败'
        this.progressStatus = 'exception'
        console.error(err)
      })
    },
    async createTriggerToken() {
      this.tokenText = '创建token中'
      const projectId = this.projectInfo.id
      const description = this.projectInfo.name
      return await Service.Projects.Triggers.create({
        projectId,
        description
      }).then(() => {
        this.tokenText = 'token创建成功'
      }, err => {
        this.$message({
          message: `TriggerToken创建失败，联系管理员`,
          type: 'error',
          duration: 0,
          showClose: true
        })
        this.tokenText = 'token创建失败'
        this.progressStatus = 'exception'
        console.error(err)
      })
    },
    async createWebHook(hookUrl, triggerData, hookType = 'hook') {
      this.hookText = `创建${hookType}中`
      const projectId = this.projectInfo.id
      const url = hookUrl || ''
      const hookData = Object.assign({
        projectId,
        url,
        push_events: false,
        tag_push_events: false,
        note_events: false,
        merge_requests_events: false,
        job_events: false,
        pipeline_events: false,
        repository_update_events: false,
        enable_ssl_verification: false
      }, triggerData)
      return await Service.Projects.Hooks.create(hookData).then(() => {}, err => {
        this.$message({
          message: `${hookType}创建失败，联系管理员`,
          type: 'error',
          duration: 0,
          showClose: true
        })
        this.hookText = `${hookType}创建失败`
        this.progressStatus = 'exception'
        console.error(err)
      })
    }
  },
  mounted() {
    this.initGroups()
  }
}
</script>

<style lang="less" scoped>
  .progress-wrapper{
    float: right;
    &>p{
      font-size: 12px;
    }
  }
</style>
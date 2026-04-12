import hudson.init.InitMilestone
import hudson.plugins.git.BranchSpec
import hudson.plugins.git.GitSCM
import hudson.plugins.git.UserRemoteConfig
import hudson.security.ACL
import hudson.security.ACLContext
import jenkins.model.Jenkins
import org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition
import org.jenkinsci.plugins.workflow.job.WorkflowJob

/**
 * Wait for full startup (incl. JCasC), then seed Pipeline jobs from file:///workspace/mosscart.
 */
void createPipelineFromScm(String jobName, String scriptPath) {
  def j = Jenkins.get()
  if (j.getItem(jobName) != null) {
    return
  }
  def remotes = [new UserRemoteConfig('file:///workspace/mosscart', null, null, null)]
  def branches = [
    new BranchSpec('*/main'),
    new BranchSpec('*/master'),
    new BranchSpec('*/HEAD'),
  ]
  def scm = new GitSCM(remotes, branches, false, [], null, null, [])
  // workflow-cps: constructor is (SCM, scriptPath) since newer releases
  def defn = new CpsScmFlowDefinition(scm, scriptPath)
  defn.setLightweight(true)
  def job = j.createProject(WorkflowJob, jobName)
  job.setDefinition(defn)
  job.save()
  println "[seed-demo-pipelines] Created job: ${jobName}"
}

Thread.start('mosscart-seed-demo-pipelines') {
  try {
    def j = Jenkins.getInstance()
    for (int i = 0; i < 120 && j.getInitLevel() != InitMilestone.COMPLETED; i++) {
      Thread.sleep(1000)
    }
    if (Jenkins.getInstance().getInitLevel() != InitMilestone.COMPLETED) {
      println '[seed-demo-pipelines] Jenkins init did not reach COMPLETED in time'
      return
    }
    // Background threads have no user; job creation needs SYSTEM ACL
    ACLContext acl = ACL.as2(ACL.SYSTEM2)
    try {
      createPipelineFromScm('mosscart-full', 'Jenkinsfile')
      createPipelineFromScm('mosscart-smoke', 'jenkins/pipelines/Jenkinsfile.smoke')
      // Manual impact-testing jobs (local mutate + optional IMPACT_TARGET_DIR sync; no push)
      createPipelineFromScm('mosscart-impact-payment-apply', 'jenkins/pipelines/Jenkinsfile.impact.payment.apply')
      createPipelineFromScm('mosscart-impact-payment-revert', 'jenkins/pipelines/Jenkinsfile.impact.payment.revert')
      createPipelineFromScm('mosscart-impact-mixed-apply', 'jenkins/pipelines/Jenkinsfile.impact.mixed.apply')
      createPipelineFromScm('mosscart-impact-mixed-revert', 'jenkins/pipelines/Jenkinsfile.impact.mixed.revert')
      createPipelineFromScm('mosscart-impact-profile-apply', 'jenkins/pipelines/Jenkinsfile.impact.profile.apply')
      createPipelineFromScm('mosscart-impact-profile-revert', 'jenkins/pipelines/Jenkinsfile.impact.profile.revert')
      createPipelineFromScm('mosscart-impact-checkout-apply', 'jenkins/pipelines/Jenkinsfile.impact.checkout.apply')
      createPipelineFromScm('mosscart-impact-checkout-revert', 'jenkins/pipelines/Jenkinsfile.impact.checkout.revert')
    } finally {
      acl.close()
    }
  } catch (Exception e) {
    println "[seed-demo-pipelines] Failed: ${e.message}"
    e.printStackTrace()
  }
}

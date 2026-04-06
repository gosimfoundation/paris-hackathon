<script setup lang="ts">
import { useI18n } from '../composables/useI18n'
import { computed } from 'vue'

console.log('RulesPage loading')

const { locale } = useI18n()

const isEn = computed(() => locale.value === 'en')
</script>

<template>
  <article class="py-32 bg-bg-primary min-h-screen">
    <div class="max-w-3xl mx-auto px-6 rules-content">

      <!-- Back link -->
      <router-link to="/" class="inline-flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors mb-12">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
        {{ isEn ? 'Back to Home' : '返回首页' }}
      </router-link>

      <template v-if="isEn">
        <h1 class="heading-serif text-4xl md:text-5xl text-text-primary mb-4">Official Rules</h1>
        <p class="text-text-tertiary mb-4">GOSIM Agentic Hackathon</p>
        <p class="text-text-tertiary/60 text-sm mb-12">Draft, subject to change</p>

        <hr class="border-border mb-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">1. Overview</h2>
        <p>GOSIM Agentic Hackathon is an official hackathon program of <strong>GOSIM Paris 2026</strong>.</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">2. Event Scope</h2>
        <p>The hackathon is part of <strong>GOSIM Paris 2026</strong>.</p>
        <p>Planned venue: <strong>STATION F, Paris</strong>.</p>
        <p>The hackathon will take place during the GOSIM Paris 2026 event window. The detailed check-in, hacking, submission, demo, and judging schedule will be announced by the organizer separately.</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">3. Eligibility</h2>
        <p>Participants must satisfy all of the following requirements:</p>
        <ul>
          <li>Be legally able to participate in a skills-based competition under the laws of their local jurisdiction</li>
          <li>Register using accurate and complete information</li>
          <li>Agree to these rules and any additional event instructions published by the organizer</li>
          <li>Participate as an individual or as part of only one team</li>
        </ul>
        <p>The organizer may refuse or revoke participation if a participant provides false information, violates applicable law, or fails to comply with these rules.</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">4. Team Rules</h2>
        <ul>
          <li>Participants may join as an individual or form a team</li>
          <li>Each team may have up to <strong>3</strong> members</li>
          <li>A participant may belong to only <strong>1</strong> team</li>
          <li>Each team may submit only <strong>1</strong> project</li>
          <li>Team membership must be finalized before the submission deadline unless the organizer explicitly approves a change</li>
        </ul>
        <p>If multiple submissions are made by the same team, the organizer may decide which submission is valid or disqualify the team.</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">5. What You May Build On</h2>
        <p>Participants may use existing open-source frameworks, models, APIs, SDKs, datasets, and previously developed personal or team code, provided that:</p>
        <ul>
          <li>The team should choose and build within a published hackathon theme available on <strong>create.gosim.org</strong></li>
          <li>The team has the legal right to use them</li>
          <li>The final submission clearly identifies major pre-existing components</li>
          <li>The project's core hackathon value comes from work substantially advanced during the hackathon period</li>
        </ul>
        <p>The organizer and judges will evaluate the originality and substance of the work delivered for this event, not just the existence of an older codebase.</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">6. Open Source and Repository Requirements</h2>
        <p>Because GOSIM is rooted in the open-source ecosystem, open development is required.</p>
        <p>Each team must maintain a project repository for its submission. The repository must:</p>
        <ul>
          <li>Be hosted on <strong>GitHub</strong> or an equivalent project repository platform</li>
          <li>Be accessible to the organizer and judges by the submission deadline</li>
          <li>Include a <strong>README</strong> explaining the project, setup, and usage</li>
          <li>Include a clearly stated open-source license using an <strong>OSI-approved</strong> license</li>
        </ul>
        <p>Examples of acceptable licenses include MIT, Apache-2.0, GPL-3.0, LGPL-3.0, MPL-2.0, and other OSI-approved licenses.</p>
        <p>Teams remain responsible for ensuring they have the legal right to publish or share any code, model, dataset, media, or other third-party component included in the repository.</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">7. Submission Requirements</h2>
        <p>Each team must submit a complete project package before the official deadline. A valid submission should include:</p>
        <ul>
          <li>Project name</li>
          <li>Team name and team member information</li>
          <li>A short project description</li>
          <li>The problem being solved and why it matters</li>
          <li>A demo link or other accessible working artifact</li>
          <li>Source repository link</li>
          <li>A demo video, recommended length <strong>3–5 minutes</strong></li>
          <li>A short list of technologies used</li>
        </ul>
        <p>Recommended but not strictly required unless later announced:</p>
        <ul>
          <li>Architecture diagram</li>
          <li>Deployment URL</li>
          <li>Sample workflow or benchmark result</li>
        </ul>
        <p>Judges are not required to install, compile, or troubleshoot a project locally. Teams are responsible for making the demo accessible and understandable.</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">8. Demo Requirements</h2>
        <p>To be eligible for judging, the project must be demonstrable.</p>
        <p>A valid demo should make it reasonably easy for judges to verify:</p>
        <ul>
          <li>What the project does</li>
          <li>What part is actually working</li>
          <li>Where the agentic behavior appears</li>
          <li>What inputs, tools, or external systems are involved</li>
          <li>What output, decision, or action the system produces</li>
        </ul>
        <p>If a demo link is broken, inaccessible, or non-functional at judging time, the team may receive a lower score or be disqualified from award consideration.</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">9. Judging Criteria</h2>
        <p>Projects will be reviewed using the published judging criteria on <strong>create.gosim.org</strong>.</p>
        <p>Each dimension counts for <strong>20%</strong> of the total score.</p>

        <h3 class="text-xl text-text-primary mt-8 mb-4">9.1 Innovation</h3>
        <p>Originality and novelty of the idea.</p>

        <h3 class="text-xl text-text-primary mt-8 mb-4">9.2 Technical Depth</h3>
        <p>Architecture, code quality, and technical complexity.</p>

        <h3 class="text-xl text-text-primary mt-8 mb-4">9.3 Completeness</h3>
        <p>Working demo and functional completeness.</p>

        <h3 class="text-xl text-text-primary mt-8 mb-4">9.4 Practicality</h3>
        <p>Real-world problem-solving potential.</p>

        <h3 class="text-xl text-text-primary mt-8 mb-4">9.5 Presentation</h3>
        <p>Clarity and persuasiveness of the demo.</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">10. Disallowed Content and Disqualification</h2>
        <p>The following may result in score reduction, ineligibility, or disqualification:</p>
        <ul>
          <li>Plagiarism or unauthorized use of third-party content, code, data, or media</li>
          <li>Projects that violate applicable law or platform policy</li>
          <li>Fraudulent, deceptive, abusive, or unsafe use cases</li>
          <li>Non-functional submissions with no credible demo</li>
          <li>Incomplete submission materials</li>
          <li>Offensive, discriminatory, harassing, or hateful content</li>
          <li>Attempts to interfere with judging, event systems, or other participants</li>
        </ul>
        <p>The organizer may investigate suspected violations and make a final determination at its sole discretion.</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">11. Code of Conduct</h2>
        <p>All participants, organizers, judges, speakers, sponsors, and volunteers are expected to behave professionally and respectfully.</p>
        <p>Participants must not engage in:</p>
        <ul>
          <li>Harassment</li>
          <li>Discrimination</li>
          <li>Intimidation</li>
          <li>Doxxing</li>
          <li>Disruptive or abusive conduct</li>
        </ul>
        <p>If a participant behaves inappropriately, the organizer may take any action it deems appropriate, including warning, removal from the event, or disqualification.</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">12. Intellectual Property</h2>
        <p>Participants retain ownership of the intellectual property in the projects they create, subject to the rights of any third-party materials they use.</p>
        <p>By participating, each team grants the organizer a non-exclusive, worldwide, royalty-free right to:</p>
        <ul>
          <li>Use the team name, project name, screenshots, logos, short descriptions, and demo excerpts</li>
          <li>Showcase the project for event operations, judging, recap materials, press, community content, and future promotional use related to the hackathon or GOSIM</li>
        </ul>
        <p>Participants are solely responsible for ensuring they have the necessary rights to all code, models, datasets, media, and content included in their submission.</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">13. AI, Models, and Third-Party Services</h2>
        <p>Participants may use proprietary or open-source AI models and third-party APIs unless explicitly restricted by the organizer or sponsor track rules.</p>
        <p>Teams must disclose any material third-party dependencies that are important to understanding:</p>
        <ul>
          <li>How the project works</li>
          <li>What is original to the team</li>
          <li>What functionality depends on external services</li>
        </ul>
        <p>The organizer may require additional disclosure for finalists.</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">14. Awards</h2>
        <p>Prize structure, award categories, sponsor prizes, and finalist selection details will be announced separately.</p>
        <p>The organizer reserves the right to:</p>
        <ul>
          <li>Not grant an award in a category if submissions do not meet the expected standard</li>
          <li>Split awards in the event of a tie or exceptional submissions</li>
          <li>Adjust category definitions before final judging if necessary</li>
        </ul>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">15. Organizer Rights</h2>
        <p>The organizer reserves the right to:</p>
        <ul>
          <li>Interpret and apply these rules</li>
          <li>Verify participant eligibility and submission validity</li>
          <li>Modify scheduling, judging format, or event mechanics when reasonably necessary</li>
          <li>Remove any participant or submission that violates these rules or undermines the event</li>
          <li>Cancel, suspend, or modify part of the event in the case of technical failure, force majeure, safety concerns, or other circumstances beyond reasonable control</li>
        </ul>
        <p>All organizer decisions regarding eligibility, judging process, and awards are final.</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">16. Changes and Clarifications</h2>
        <p>The organizer may update these rules, publish FAQs, or release clarifications before the submission deadline.</p>
        <p>If there is any conflict between a summary page, announcement post, and the latest published official rules, the latest published official rules will control.</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">17. Contact</h2>
        <p>Questions related to registration, rules, submissions, judging, or sponsor tracks should be directed to the official GOSIM hackathon contact channels to be announced by the organizer.</p>

      </template>

      <template v-else>
        <h1 class="heading-serif text-4xl md:text-5xl text-text-primary mb-4">官方规则</h1>
        <p class="text-text-tertiary mb-4">GOSIM Agentic Hackathon</p>
        <p class="text-text-tertiary/60 text-sm mb-12">草案，可能会有调整</p>

        <hr class="border-border mb-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">1. 概述</h2>
        <p>GOSIM Agentic Hackathon 是 <strong>GOSIM Paris 2026</strong> 的官方黑客松项目。</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">2. 活动范围</h2>
        <p>本黑客松是 <strong>GOSIM Paris 2026</strong> 的一部分。</p>
        <p>计划场地：<strong>STATION F，巴黎</strong>。</p>
        <p>黑客松将在 GOSIM Paris 2026 活动期间举行。具体的签到、开发、提交、演示和评审日程将由主办方另行公布。</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">3. 参赛资格</h2>
        <p>参赛者必须满足以下所有条件：</p>
        <ul>
          <li>根据其所在司法管辖区的法律，能够合法参加技能竞赛</li>
          <li>使用准确、完整的信息进行注册</li>
          <li>同意本规则及主办方发布的任何附加活动说明</li>
          <li>以个人身份或仅作为一个团队的成员参赛</li>
        </ul>
        <p>如果参赛者提供虚假信息、违反适用法律或未遵守本规则，主办方可拒绝或撤销其参赛资格。</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">4. 团队规则</h2>
        <ul>
          <li>参赛者可以个人身份参赛或组队参赛</li>
          <li>每个团队最多 <strong>3</strong> 名成员</li>
          <li>每位参赛者只能加入 <strong>1</strong> 个团队</li>
          <li>每个团队只能提交 <strong>1</strong> 个项目</li>
          <li>团队成员必须在提交截止日期前确定，除非主办方明确批准变更</li>
        </ul>
        <p>如果同一团队提交了多份作品，主办方可决定哪份有效或取消该团队资格。</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">5. 可使用的构建基础</h2>
        <p>参赛者可以使用现有的开源框架、模型、API、SDK、数据集和此前开发的个人或团队代码，但须满足以下条件：</p>
        <ul>
          <li>团队应在 <strong>create.gosim.org</strong> 上公布的黑客松主题范围内选择和构建</li>
          <li>团队拥有使用这些资源的合法权利</li>
          <li>最终提交清楚标注了主要的预先存在的组件</li>
          <li>项目的核心黑客松价值来自于在比赛期间实质性推进的工作</li>
        </ul>
        <p>主办方和评委将评估本次活动中交付的工作的原创性和实质性，而非仅凭已有代码库的存在。</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">6. 开源和仓库要求</h2>
        <p>由于 GOSIM 植根于开源生态，开放开发是必须的。</p>
        <p>每个团队必须为其提交作品维护一个项目仓库。仓库必须：</p>
        <ul>
          <li>托管在 <strong>GitHub</strong> 或同等的项目仓库平台上</li>
          <li>在提交截止日期前对主办方和评委可访问</li>
          <li>包含说明项目、设置和使用方法的 <strong>README</strong></li>
          <li>包含使用 <strong>OSI 认证</strong>许可证明确声明的开源协议</li>
        </ul>
        <p>可接受的许可证示例包括 MIT、Apache-2.0、GPL-3.0、LGPL-3.0、MPL-2.0 及其他 OSI 认证许可证。</p>
        <p>团队有责任确保其拥有发布或共享仓库中包含的任何代码、模型、数据集、媒体或其他第三方组件的合法权利。</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">7. 提交要求</h2>
        <p>每个团队必须在官方截止日期前提交完整的项目包。有效的提交应包括：</p>
        <ul>
          <li>项目名称</li>
          <li>团队名称和团队成员信息</li>
          <li>简短的项目描述</li>
          <li>所解决的问题及其重要性</li>
          <li>演示链接或其他可访问的工作产物</li>
          <li>源代码仓库链接</li>
          <li>演示视频，建议时长 <strong>3–5 分钟</strong></li>
          <li>使用的技术简列</li>
        </ul>
        <p>推荐但不强制要求（除非后续另行通知）：</p>
        <ul>
          <li>架构图</li>
          <li>部署 URL</li>
          <li>示例工作流或基准测试结果</li>
        </ul>
        <p>评委无需在本地安装、编译或调试项目。团队有责任确保演示可访问且易于理解。</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">8. 演示要求</h2>
        <p>项目必须可演示才有资格参加评审。</p>
        <p>有效的演示应使评委能够合理验证：</p>
        <ul>
          <li>项目做了什么</li>
          <li>哪些部分实际可运行</li>
          <li>智能体行为出现在哪里</li>
          <li>涉及哪些输入、工具或外部系统</li>
          <li>系统产生了什么输出、决策或行动</li>
        </ul>
        <p>如果演示链接在评审时损坏、无法访问或无法运行，团队可能会获得较低的分数或被取消获奖资格。</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">9. 评审标准</h2>
        <p>项目将根据 <strong>create.gosim.org</strong> 上公布的评审标准进行评审。</p>
        <p>每个维度占总分的 <strong>20%</strong>。</p>

        <h3 class="text-xl text-text-primary mt-8 mb-4">9.1 创新性</h3>
        <p>创意的原创性和新颖性。</p>

        <h3 class="text-xl text-text-primary mt-8 mb-4">9.2 技术深度</h3>
        <p>架构、代码质量和技术复杂度。</p>

        <h3 class="text-xl text-text-primary mt-8 mb-4">9.3 完整度</h3>
        <p>可运行的演示和功能完整性。</p>

        <h3 class="text-xl text-text-primary mt-8 mb-4">9.4 实用性</h3>
        <p>解决现实问题的潜力。</p>

        <h3 class="text-xl text-text-primary mt-8 mb-4">9.5 展示</h3>
        <p>演示的清晰度和说服力。</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">10. 禁止内容和取消资格</h2>
        <p>以下行为可能导致扣分、失去资格或被取消参赛：</p>
        <ul>
          <li>抄袭或未经授权使用第三方内容、代码、数据或媒体</li>
          <li>违反适用法律或平台政策的项目</li>
          <li>欺诈性、欺骗性、滥用性或不安全的用例</li>
          <li>没有可信演示的无功能提交</li>
          <li>不完整的提交材料</li>
          <li>冒犯性、歧视性、骚扰性或仇恨性内容</li>
          <li>干扰评审、活动系统或其他参赛者的行为</li>
        </ul>
        <p>主办方可调查涉嫌违规行为，并自行做出最终裁定。</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">11. 行为准则</h2>
        <p>所有参赛者、主办方、评委、演讲者、赞助商和志愿者都应表现出专业和尊重。</p>
        <p>参赛者不得从事以下行为：</p>
        <ul>
          <li>骚扰</li>
          <li>歧视</li>
          <li>恐吓</li>
          <li>人肉搜索</li>
          <li>破坏性或辱骂性行为</li>
        </ul>
        <p>如果参赛者行为不当，主办方可采取其认为适当的任何措施，包括警告、将其移出活动或取消参赛资格。</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">12. 知识产权</h2>
        <p>参赛者保留其创建项目中知识产权的所有权，但须遵守其使用的任何第三方材料的相关权利。</p>
        <p>参赛即表示每个团队授予主办方非独占性、全球性、免版税的权利：</p>
        <ul>
          <li>使用团队名称、项目名称、截图、标志、简短描述和演示摘录</li>
          <li>在活动运营、评审、回顾材料、新闻、社区内容以及与黑客松或 GOSIM 相关的未来推广中展示项目</li>
        </ul>
        <p>参赛者全权负责确保其拥有提交中包含的所有代码、模型、数据集、媒体和内容的必要权利。</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">13. AI、模型和第三方服务</h2>
        <p>参赛者可以使用专有或开源 AI 模型及第三方 API，除非主办方或赞助商赛道规则明确限制。</p>
        <p>团队必须披露对理解以下内容重要的任何实质性第三方依赖：</p>
        <ul>
          <li>项目如何运作</li>
          <li>哪些内容为团队原创</li>
          <li>哪些功能依赖外部服务</li>
        </ul>
        <p>主办方可能要求入围团队进行额外披露。</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">14. 奖项</h2>
        <p>奖金结构、奖项类别、赞助商奖项和入围选拔详情将另行公布。</p>
        <p>主办方保留以下权利：</p>
        <ul>
          <li>如果提交作品未达到预期标准，可不在某一类别中颁奖</li>
          <li>在出现平局或特别优秀的提交时拆分奖项</li>
          <li>在最终评审前根据需要调整类别定义</li>
        </ul>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">15. 主办方权利</h2>
        <p>主办方保留以下权利：</p>
        <ul>
          <li>解释和执行本规则</li>
          <li>核实参赛者资格和提交有效性</li>
          <li>在合理必要时修改赛程安排、评审形式或活动机制</li>
          <li>移除任何违反本规则或损害活动的参赛者或提交作品</li>
          <li>在技术故障、不可抗力、安全问题或其他超出合理控制范围的情况下，取消、暂停或修改活动的部分内容</li>
        </ul>
        <p>主办方关于资格、评审流程和奖项的所有决定为最终决定。</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">16. 变更和说明</h2>
        <p>主办方可在提交截止日期前更新本规则、发布常见问题或发布澄清说明。</p>
        <p>如果摘要页面、公告帖子与最新发布的官方规则之间存在任何冲突，以最新发布的官方规则为准。</p>

        <hr class="border-border my-12" />

        <h2 class="heading-serif text-2xl text-text-primary mb-6">17. 联系方式</h2>
        <p>有关注册、规则、提交、评审或赞助商赛道的问题，请通过主办方即将公布的官方 GOSIM 黑客松联系渠道进行咨询。</p>

      </template>

    </div>
  </article>
</template>

<style scoped>
.rules-content p {
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin-bottom: 1rem;
}

.rules-content ul {
  list-style: disc;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.rules-content li {
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin-bottom: 0.5rem;
}

.rules-content a {
  color: var(--color-accent-blue, #3BA7D0);
}
</style>

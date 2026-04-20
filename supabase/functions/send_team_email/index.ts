// Edge Function: send_team_email
// Sends GOSIM-branded emails via Lark SMTP.
// Supported kinds: "invite" | "pending_reminder" | "accepted" | "declined"

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SMTP_HOST = "smtp.larksuite.com"
const SMTP_PORT = 465
const SMTP_USER = Deno.env.get("LARK_SMTP_USER") ?? "hackathon@gosim.org"
const SMTP_PASS = Deno.env.get("LARK_SMTP_PASS")!
const SITE_URL = "https://create.gosim.org"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function wrap(title: string, innerHtml: string, cta?: { url: string; label: string }) {
  const button = cta
    ? `<div style="text-align:center;margin-bottom:32px">
         <a href="${cta.url}" style="display:inline-block;padding:14px 32px;background:#d4a017;color:#000;font-weight:700;font-size:15px;text-decoration:none;letter-spacing:0.1em;text-transform:uppercase">${cta.label}</a>
       </div>`
    : ""
  return `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;background:#0a0a0a;color:#e5e5e5">
    <div style="text-align:center;margin-bottom:32px">
      <img src="https://gosim.org/favicon-256.png" width="48" height="48" style="border-radius:50%" />
    </div>
    <h1 style="font-size:26px;font-weight:700;color:#ffffff;margin-bottom:20px;line-height:1.3">${title}</h1>
    ${innerHtml}
    ${button}
    <hr style="border:none;border-top:1px solid #222;margin:32px 0"/>
    <p style="color:#555;font-size:12px;text-align:center">GOSIM Agentic Hackathon 2026 · Paris · STATION F</p>
  </div>`
}

const P = (text: string) => `<p style="color:#cfcfcf;font-size:16px;line-height:1.7;margin-bottom:18px">${text}</p>`
const B = (s: string) => `<strong style="color:#ffffff">${s}</strong>`

interface Payload {
  kind: "invite" | "pending_reminder" | "accepted" | "declined" | "join_request" | "join_approved" | "join_rejected"
  to?: string
  to_user_id?: string
  invite_id?: string        // for invite/accepted/declined: look up from team_invitations
  team_id?: string          // for join_*: team context
  user_id?: string          // for join_*: the applicant
  data?: Record<string, string>
}

async function hydrateFromTeamUser(teamId: string, applicantId: string) {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)
  const { data: team } = await admin.from("teams").select("name, leader_id").eq("id", teamId).single()
  if (!team) return null
  const [{ data: applicant }, { data: leader }, { data: appAuth }, { data: ldrAuth }] = await Promise.all([
    admin.from("profiles").select("name").eq("id", applicantId).single(),
    admin.from("profiles").select("name").eq("id", team.leader_id).single(),
    admin.auth.admin.getUserById(applicantId),
    admin.auth.admin.getUserById(team.leader_id),
  ])
  return {
    teamName: team.name,
    applicantName: applicant?.name || "",
    leaderName: leader?.name || "",
    applicantEmail: appAuth.user?.email,
    leaderEmail: ldrAuth.user?.email,
  }
}

async function hydrateFromInvite(inviteId: string, kind: Payload["kind"]) {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)
  const { data: inv } = await admin.from("team_invitations").select("team_id, invited_user_id, invited_by, message").eq("id", inviteId).single()
  if (!inv) return null
  const [{ data: team }, { data: inviter }, { data: invitee }, { data: inviteeAuth }, { data: inviterAuth }] = await Promise.all([
    admin.from("teams").select("name").eq("id", inv.team_id).single(),
    admin.from("profiles").select("name").eq("id", inv.invited_by).single(),
    admin.from("profiles").select("name").eq("id", inv.invited_user_id).single(),
    admin.auth.admin.getUserById(inv.invited_user_id),
    admin.auth.admin.getUserById(inv.invited_by),
  ])
  // For "invite" email goes to invitee; for "accepted"/"declined" email goes back to inviter (leader)
  const toInvitee = kind === "invite"
  return {
    to: toInvitee ? inviteeAuth.user?.email : inviterAuth.user?.email,
    data: {
      leaderName: inviter?.name || "A team leader",
      teamName: team?.name || "their team",
      inviteeName: invitee?.name || "",
      message: inv.message || "",
    },
  }
}

function compose(p: { kind: Payload["kind"]; data: Record<string,string> }): { subject: string; html: string; text: string } {
  const { kind, data } = p
  if (kind === "invite") {
    const subject = `${data.leaderName} invited you to team "${data.teamName}"`
    const body = P(`Hi ${data.inviteeName || "there"},`)
      + P(`${B(data.leaderName)} invited you to join their team ${B(`"${data.teamName}"`)} for GOSIM Agentic Hackathon Paris.`)
      + (data.message ? P(`Their message: <em>"${data.message}"</em>`) : "")
      + P("Head to the site to accept or decline this invitation.")
    const html = wrap("You've been invited to a team!", body, { url: `${SITE_URL}/#teams`, label: "View Invitation" })
    const text = `${data.leaderName} invited you to team "${data.teamName}". Visit ${SITE_URL}/#teams to respond.`
    return { subject, html, text }
  }
  if (kind === "join_request") {
    const subject = `${data.applicantName || "Someone"} wants to join your team "${data.teamName}"`
    const body = P(`Hi ${data.leaderName || "there"},`)
      + P(`${B(data.applicantName || "A builder")} just requested to join your team ${B(`"${data.teamName}"`)}. Review their profile and approve or decline.`)
    const html = wrap("New join request", body, { url: `${SITE_URL}/#teams`, label: "Review Request" })
    return { subject, html, text: `${data.applicantName} wants to join "${data.teamName}". Visit ${SITE_URL}/#teams` }
  }
  if (kind === "join_approved") {
    const subject = `You're in team "${data.teamName}"!`
    const body = P(`Hi ${data.applicantName || "there"},`)
      + P(`${B(data.leaderName || "The team leader")} approved your request to join ${B(`"${data.teamName}"`)}. Welcome aboard!`)
    const html = wrap("Welcome to the team!", body, { url: `${SITE_URL}/#teams`, label: "View Team" })
    return { subject, html, text: `You're in team "${data.teamName}". Visit ${SITE_URL}/#teams` }
  }
  if (kind === "join_rejected") {
    const subject = `Update on your request to join "${data.teamName}"`
    const body = P(`Hi ${data.applicantName || "there"},`)
      + P(`Unfortunately the leader of ${B(`"${data.teamName}"`)} couldn't take you this time. Plenty of other teams are still looking for members.`)
    const html = wrap("Team update", body, { url: `${SITE_URL}/#teams`, label: "Browse Teams" })
    return { subject, html, text: `Your request to "${data.teamName}" wasn't accepted. Visit ${SITE_URL}/#teams to find another.` }
  }
  if (kind === "pending_reminder") {
    const subject = `You have pending join requests for "${data.teamName}"`
    const body = P(`Hi ${data.leaderName || "there"},`)
      + P(`${B(data.pendingCount)} ${Number(data.pendingCount) === 1 ? "builder has" : "builders have"} requested to join your team ${B(`"${data.teamName}"`)}.`)
      + P("Review the requests so they don't get stuck waiting.")
    const html = wrap("Pending join requests", body, { url: `${SITE_URL}/#teams`, label: "Review Requests" })
    const text = `${data.pendingCount} pending request(s) for team "${data.teamName}". Visit ${SITE_URL}/#teams to review.`
    return { subject, html, text }
  }
  if (kind === "accepted") {
    const subject = `${data.inviteeName || "Someone"} accepted your invite to "${data.teamName}"`
    const body = P(`Hi ${data.leaderName || "there"},`)
      + P(`${B(data.inviteeName || "A builder")} just accepted your invitation to join ${B(`"${data.teamName}"`)}. Welcome them and get started!`)
    const html = wrap("Your team just grew!", body, { url: `${SITE_URL}/#teams`, label: "View Team" })
    return { subject, html, text: `${data.inviteeName} accepted your invite to "${data.teamName}". Visit ${SITE_URL}/#teams` }
  }
  // declined
  const subject = `${data.inviteeName || "Someone"} declined your invite to "${data.teamName}"`
  const body = P(`Hi ${data.leaderName || "there"},`)
    + P(`${B(data.inviteeName || "A builder")} declined your invitation to join ${B(`"${data.teamName}"`)}. Don't worry, there are still plenty of builders looking for teams.`)
  const html = wrap("Invitation declined", body, { url: `${SITE_URL}/#teams`, label: "Browse Builders" })
  return { subject, html, text: `${data.inviteeName} declined your invite to "${data.teamName}". Visit ${SITE_URL}/#teams to find others.` }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) return new Response(JSON.stringify({ error: "Missing auth" }), { status: 401, headers: corsHeaders })

    // Verify caller via Supabase (must be logged-in user)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders })

    const payload = await req.json() as Payload

    // Hydrate from invite_id if provided (preferred path for invite/accepted/declined)
    if (payload.invite_id && !payload.data) {
      const hydrated = await hydrateFromInvite(payload.invite_id, payload.kind)
      if (!hydrated || !hydrated.to) return new Response(JSON.stringify({ error: "Invite not found or no email" }), { status: 400, headers: corsHeaders })
      payload.to = hydrated.to
      payload.data = hydrated.data
    }

    // Hydrate from team_id + user_id for join_* kinds
    if (!payload.data && payload.team_id && payload.user_id &&
        (payload.kind === "join_request" || payload.kind === "join_approved" || payload.kind === "join_rejected")) {
      const h = await hydrateFromTeamUser(payload.team_id, payload.user_id)
      if (!h) return new Response(JSON.stringify({ error: "Team or user not found" }), { status: 400, headers: corsHeaders })
      payload.data = {
        leaderName: h.leaderName,
        teamName: h.teamName,
        applicantName: h.applicantName,
        inviteeName: h.applicantName, // alias for compose
      }
      payload.to = payload.kind === "join_request" ? h.leaderEmail : h.applicantEmail
    }
    payload.data = payload.data || {}

    let toEmail = payload.to
    if (!toEmail && payload.to_user_id) {
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)
      const { data: adminUser } = await admin.auth.admin.getUserById(payload.to_user_id)
      toEmail = adminUser.user?.email
    }
    if (!toEmail) return new Response(JSON.stringify({ error: "No recipient" }), { status: 400, headers: corsHeaders })
    const { subject, html, text } = compose(payload as { kind: Payload["kind"]; data: Record<string,string>; to: string })

    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        tls: true,
        auth: { username: SMTP_USER, password: SMTP_PASS },
      },
    })
    await client.send({
      from: `GOSIM Hackathon <${SMTP_USER}>`,
      to: toEmail,
      subject,
      content: text,
      html,
    })
    await client.close()

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
  }
})

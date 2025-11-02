import { NextRequest, NextResponse } from 'next/server'

// Keep user's structure: treat env as base that may or may not include '/api'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com';

export async function POST(req: NextRequest) {
  try {
    const forwardHeaders: Record<string, string> = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    const incomingAuth = req.headers.get('authorization');
    const incomingCookie = req.headers.get('cookie');
    if (incomingAuth) forwardHeaders['Authorization'] = incomingAuth;
    if (incomingCookie) forwardHeaders['Cookie'] = incomingCookie;

    // Read body once and try to parse JSON; we'll enrich if stationId is missing
    const rawBodyText = await req.text();
    let payload: any = null;
    try { payload = rawBodyText ? JSON.parse(rawBodyText) : null; } catch { payload = null; }

    // Attempt to enrich stationId if missing by using stationName from token/profile
    try {
      const hasStationId = payload && (payload.stationId || payload.StationID || payload.stationID || payload.StationId);
      if (payload && !hasStationId) {
        // 1) Try to decode JWT from Authorization to get stationName/stationId
        let token: string | null = null;
        if (incomingAuth && /bearer\s+/i.test(incomingAuth)) {
          token = incomingAuth.split(/\s+/)[1] || null;
        }

        // Helper to decode base64url without atob in Node
        function decodeJwt(t: string) {
          try {
            const part = t.split('.')[1];
            if (!part) return null;
            const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
            const json = Buffer.from(b64, 'base64').toString('utf8');
            return JSON.parse(json);
          } catch { return null; }
        }

        let tokenStationId: string | undefined;
        let tokenStationName: string | undefined;
        let tokenRole: string | undefined;
        if (token) {
          const decoded = decodeJwt(token) as any;
          tokenStationId = decoded?.stationId || decoded?.StationID || decoded?.stationID || decoded?.StationId || undefined;
          tokenStationName = decoded?.stationName || decoded?.StationName || undefined;
          tokenRole = decoded?.role || decoded?.Role || undefined;
        }

        // 2) If still missing, call backend profile to get station association
        if (!tokenStationId) {
          try {
            const meUrl = `${API_URL}/api/Auth/me`;
            const meResp = await fetch(meUrl, { method: 'GET', headers: forwardHeaders });
            if (meResp.ok) {
              const meData = await meResp.json().catch(() => null);
              const obj = meData?.data || meData || null;
              const fetchedId = obj ? (obj.StationID || obj.stationID || obj.stationId || obj.StationId) : undefined;
              const fetchedName = obj ? (obj.StationName || obj.stationName) : undefined;
              if (!tokenStationId && fetchedId) tokenStationId = String(fetchedId);
              if (!tokenStationName && fetchedName) tokenStationName = String(fetchedName);
            }
          } catch {}
        }

        // 3) If Staff and we still don't have stationId but have stationName, map via Station/AllStations
        const isStaff = tokenRole && String(tokenRole).toLowerCase() === 'staff';
        if (!tokenStationId && tokenStationName && isStaff) {
          try {
            const stationsUrl = `${API_URL}/api/Station/AllStations`;
            const stationsResp = await fetch(stationsUrl, { method: 'GET', headers: forwardHeaders });
            const stations = await stationsResp.json().catch(() => [] as any[]);
            if (Array.isArray(stations) && stations.length > 0) {
              const found = stations.find((s: any) => {
                const name = s?.stationName || s?.StationName;
                return name && String(name).toLowerCase() === String(tokenStationName).toLowerCase();
              });
              if (found) {
                const sid = found.stationID || found.StationID || found.stationId || found.StationId;
                if (sid) {
                  payload.stationId = String(sid);
                }
              }
            }
          } catch {}
        }

        // If we still don't have stationId but token had it, set it now
        if (!payload.stationId && tokenStationId) payload.stationId = String(tokenStationId);
      }
    } catch (e) {
      // ignore enrichment errors; we'll forward as-is
    }

  const url = `${API_URL}/api/BatteryTransfer/CreateTransfer`;
    const resp = await fetch(url, { method: 'POST', headers: forwardHeaders, body: payload ? JSON.stringify(payload) : rawBodyText });
    const text = await resp.text().catch(() => '');
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    if (!resp.ok) return NextResponse.json({ success: false, message: data?.message || 'Backend error', backend: data }, { status: resp.status });
    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('[proxy transfer create] error', e);
    return NextResponse.json({ success: false, message: 'Error connecting to backend' }, { status: 500 });
  }
}

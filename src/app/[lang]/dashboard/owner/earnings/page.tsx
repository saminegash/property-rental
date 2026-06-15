import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { formatRate } from "@/lib/commission";

export const dynamic = "force-dynamic";

export default async function OwnerEarningsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${lang}/login`);
  }

  // 1. Fetch Owner's Listings
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title")
    .eq("owner_id", user.id);

  const listingIds = listings?.map((l) => l.id) || [];

  // 2. Fetch Requests for those listings
  const { data: allRequests } = await supabase
    .from("requests")
    .select("id, status, listing_id, start_date, end_date")
    .in("listing_id", listingIds)
    .order("end_date", { ascending: false });

  const requestIds = allRequests?.map((r) => r.id) || [];

  // 3. Fetch Commissions for those requests
  const { data: commissions } = await supabase
    .from("commissions")
    .select(
      "id, request_id, deal_amount, commission_rate, commission_amount, status, created_at",
    )
    .in("request_id", requestIds)
    .order("created_at", { ascending: false });

  // 4. Fetch Security Deposits for those requests
  const { data: securityDeposits } = await supabase
    .from("security_deposits")
    .select("id, request_id, deposit_amount, deposit_status")
    .in("request_id", requestIds);

  // 5. Calculate Metrics
  const completedRequests =
    allRequests?.filter((r) => r.status === "completed") || [];
  const confirmedRequests =
    allRequests?.filter((r) => r.status === "confirmed") || [];

  const completedRequestIds = completedRequests.map((r) => r.id);

  // We rely on 'deal_amount' to ensure we never fake data and align with admin billing
  const completedCommissions =
    commissions?.filter((c) => completedRequestIds.includes(c.request_id!)) ||
    [];

  const totalGrossEarnings = completedCommissions.reduce(
    (sum, c) => sum + (c.deal_amount || 0),
    0,
  );
  const totalPlatformCommission = completedCommissions.reduce(
    (sum, c) => sum + (c.commission_amount || 0),
    0,
  );
  const netEarnings = totalGrossEarnings - totalPlatformCommission;

  const pendingCommissionsAmount =
    commissions
      ?.filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;
  const collectedCommissionsAmount =
    commissions
      ?.filter((c) => c.status === "collected")
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;

  const totalSecurityDepositsHeld =
    securityDeposits
      ?.filter((d) => d.deposit_status === "collected")
      .reduce((sum, d) => sum + (d.deposit_amount || 0), 0) || 0;
  const totalSecurityDepositsWithheld =
    securityDeposits
      ?.filter((d) => d.deposit_status === "forfeited")
      .reduce((sum, d) => sum + (d.deposit_amount || 0), 0) || 0;

  // Earnings by Listing
  const earningsByListing =
    listings
      ?.map((listing) => {
        const reqs = completedRequests
          .filter((r) => r.listing_id === listing.id)
          .map((r) => r.id);
        const comms = completedCommissions.filter((c) =>
          reqs.includes(c.request_id!),
        );
        const gross = comms.reduce((sum, c) => sum + (c.deal_amount || 0), 0);
        const comm = comms.reduce(
          (sum, c) => sum + (c.commission_amount || 0),
          0,
        );
        return {
          id: listing.id,
          title: listing.title,
          deals: reqs.length,
          gross,
          net: gross - comm,
        };
      })
      .filter((l) => l.deals > 0)
      .sort((a, b) => b.net - a.net) || [];

  // Recent Completed Deals
  const recentDeals = completedRequests.slice(0, 5).map((req) => {
    const comm = completedCommissions.find((c) => c.request_id === req.id);
    const listing = listings?.find((l) => l.id === req.listing_id);
    return {
      id: req.id,
      listingTitle: listing?.title || "Unknown Listing",
      endDate: req.end_date || new Date().toISOString(),
      gross: comm?.deal_amount || 0,
      commission: comm?.commission_amount || 0,
      commissionRate: comm?.commission_rate ?? null, // ← new
      net: (comm?.deal_amount || 0) - (comm?.commission_amount || 0),
    };
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 className="dashboard-title" style={{ marginBottom: "0.25rem" }}>
            Earnings Overview
          </h1>
          <p
            style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}
          >
            Track your gross earnings, commission payments, and finalized net
            payouts.
          </p>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-text-muted)",
              marginBottom: "0.5rem",
            }}
          >
            Net Earnings
          </h3>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--color-success-text)",
              lineHeight: 1,
            }}
          >
            {formatCurrency(netEarnings)}
          </p>
          <div
            style={{
              marginTop: "1rem",
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
            }}
          >
            Total Gross minus Platform Commission
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-text-muted)",
              marginBottom: "0.5rem",
            }}
          >
            Gross Earnings
          </h3>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--color-text-heading)",
              lineHeight: 1,
            }}
          >
            {formatCurrency(totalGrossEarnings)}
          </p>
          <div
            style={{
              marginTop: "1rem",
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
            }}
          >
            Base rental revenue (excludes fees)
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Platform Commission
              </h3>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "var(--color-text-heading)",
                  lineHeight: 1,
                }}
              >
                {formatCurrency(totalPlatformCommission)}
              </p>
            </div>
          </div>
          <div
            style={{
              marginTop: "1rem",
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Pending: {formatCurrency(pendingCommissionsAmount)}</span>
            <span>Collected: {formatCurrency(collectedCommissionsAmount)}</span>
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Deals
              </h3>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "var(--color-text-heading)",
                  lineHeight: 1,
                }}
              >
                {completedRequests.length}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Active
              </h3>
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  lineHeight: 1,
                }}
              >
                {confirmedRequests.length}
              </p>
            </div>
          </div>
          <div
            style={{
              marginTop: "1rem",
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
            }}
          >
            Completed vs currently active/confirmed.
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        {/* Security Deposits Summary */}
        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--color-text-heading)",
              marginBottom: "1rem",
            }}
          >
            Security Deposits
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid var(--color-border-light)",
              }}
            >
              <span style={{ color: "var(--color-text-muted)" }}>
                Currently Held by Admin
              </span>
              <span style={{ fontWeight: 600 }}>
                {formatCurrency(totalSecurityDepositsHeld)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-muted)" }}>
                Withheld for Damages (Payouts)
              </span>
              <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>
                {formatCurrency(totalSecurityDepositsWithheld)}
              </span>
            </div>
          </div>
        </div>

        {/* Earnings By Listing */}
        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--color-text-heading)",
              marginBottom: "1rem",
            }}
          >
            Top Earning Listings
          </h2>
          {earningsByListing.length === 0 ? (
            <p
              style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}
            >
              No completed deals yet.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {earningsByListing.slice(0, 3).map((listing) => (
                <div
                  key={listing.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: "var(--color-text-heading)",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    {listing.title} ({listing.deals})
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    {formatCurrency(listing.net)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Deals Table */}
      <div style={{ marginBottom: "3rem" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--color-text-heading)",
            marginBottom: "1.5rem",
          }}
        >
          Recent Completed Deals
        </h2>

        {recentDeals.length === 0 ? (
          <div
            className="dashboard-card"
            style={{ textAlign: "center", padding: "3rem 1.5rem" }}
          >
            <p className="dashboard-hint">
              You have no recently completed deals.
            </p>
          </div>
        ) : (
          <div className="dashboard-card" style={{ padding: "0" }}>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.875rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-surface)",
                    }}
                  >
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      End Date
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Listing
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "right",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Gross
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "right",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Comm. (5%)
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "right",
                        fontWeight: 600,
                        color: "var(--color-text-heading)",
                      }}
                    >
                      Net
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeals.map((deal) => (
                    <tr
                      key={deal.id}
                      style={{
                        borderBottom: "1px solid var(--color-surface-hover)",
                      }}
                    >
                      <td
                        style={{ padding: "1rem", color: "var(--color-text)" }}
                      >
                        {new Date(deal.endDate).toLocaleDateString()}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          color: "var(--color-text)",
                          fontWeight: 500,
                        }}
                      >
                        {deal.listingTitle}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          textAlign: "right",
                          color: "var(--color-text)",
                        }}
                      >
                        {formatCurrency(deal.gross)}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          textAlign: "right",
                          color: "var(--color-text)",
                        }}
                      >
                        {formatCurrency(deal.commission)}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          textAlign: "right",
                          fontWeight: 600,
                          color: "var(--color-success-text)",
                        }}
                      >
                        {formatCurrency(deal.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          padding: "1rem",
          backgroundColor: "var(--color-surface)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border-light)",
          fontSize: "0.875rem",
          color: "var(--color-text-muted)",
        }}
      >
        <strong>Calculation Note:</strong> Driver fees, delivery fees, and
        security deposits are explicitly excluded from the base rental revenue
        subject to commission. Platform commission strictly applies to the base
        daily/weekly/monthly rate. Revenue amounts only populate after an
        administrator finalizes a request and generates a commission statement.
      </div>
    </div>
  );
}

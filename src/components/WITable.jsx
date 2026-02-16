export default function WITable({ wiList = [] }) {
	return (
		<div style={{ overflowX: 'auto' }}>
			<table style={{ width: '100%', borderCollapse: 'collapse' }}>
				<thead>
					<tr style={{ textAlign: 'left', background: '#F7F9FF' }}>
						<th style={{ padding: '10px' }}>No</th>
						<th style={{ padding: '10px' }}>Customer</th>
						<th style={{ padding: '10px' }}>Part Number</th>
						<th style={{ padding: '10px' }}>Model</th>
						<th style={{ padding: '10px' }}>Status</th>
					</tr>
				</thead>
				<tbody>
					{wiList.length === 0 ? (
						<tr>
							<td colSpan={5} style={{ padding: '12px', textAlign: 'center' }}>
								Tidak ada data
							</td>
						</tr>
					) : (
						wiList.map((w, i) => (
							<tr key={w.id ?? i}>
								<td style={{ padding: '8px' }}>{i + 1}</td>
								<td style={{ padding: '8px' }}>{w.customer ?? '-'}</td>
								<td style={{ padding: '8px' }}>{w.part_number ?? '-'}</td>
								<td style={{ padding: '8px' }}>{w.model ?? '-'}</td>
								<td style={{ padding: '8px' }}>{w.status_oc ?? w.status ?? '-'}</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
}


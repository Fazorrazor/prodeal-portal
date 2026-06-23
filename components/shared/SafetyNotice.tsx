import { PolicyBanner } from './PolicyBanner';

export function SafetyNotice() {
  return (
    <PolicyBanner title="Safety & Compliance Notice" variant="warning">
      <p>
        Industrial chemicals are subject to strict regulatory compliance. 
        Material Safety Data Sheets (MSDS) must be reviewed prior to procurement.
        Use of these compounds is restricted to certified industrial and laboratory applications.
      </p>
    </PolicyBanner>
  );
}

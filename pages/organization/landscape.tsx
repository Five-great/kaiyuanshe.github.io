import { t } from 'i18next-mobx';
import dynamic from 'next/dynamic';
import { Container } from 'react-bootstrap';

import PageHead from '../../components/PageHead';

const OrganizationLandscape = dynamic(
  () => import('../../components/Organization/LandScape'),
  { ssr: false },
);

export default function LandscapePage() {
  return (
    <Container className="mb-5">
      <PageHead title={t("panorama_of_china_open_source_community")}/>

      <h2 className="mt-5 text-center">{t("panorama_of_china_open_source_community")}</h2>

      <OrganizationLandscape />
    </Container>
  );
}

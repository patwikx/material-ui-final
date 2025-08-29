import RoomListPage from './components/room-list-page';
import { getAllRooms } from '@/lib/actions/room-management';

const RoomsPage = async ({ params }: { params: { businessUnitId: string } }) => {
  const { businessUnitId } = await params; // Await the params object
  const rooms = await getAllRooms(businessUnitId);

  return <RoomListPage initialRooms={rooms} />;
};

export default RoomsPage;
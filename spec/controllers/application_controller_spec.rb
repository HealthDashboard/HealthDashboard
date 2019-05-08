require 'rails_helper'

RSpec.describe ApplicationController, type: :controller do
  let(:user) { User.new(email: 'test@test.com', password: '123456') }

  describe 'authenticate_admin_user!' do
    context 'without a logged in user' do
      before do
        expect(subject).to receive(:current_user).at_least(:once).and_return nil
      end

      it 'redirects to root path' do
        expect(subject).to receive(:redirect_to).with(root_path)
        subject.send(:authenticate_admin_user!)
      end
    end

    context 'with a logged in user' do
      before do
        expect(subject).to receive(:current_user).at_least(:once).and_return user
      end

      it 'redirects to root path' do
        expect(subject).to receive(:redirect_to).with(root_path)
        subject.send(:authenticate_admin_user!)
      end
    end

    context 'with a logged in admin' do
      let(:admin_user) { User.new(email: 'test@test.com', password: '123456', admin: true) }

      before do
        expect(subject).to receive(:current_user).at_least(:once).and_return admin_user
      end

      it 'redirects to root path' do
        expect(subject).to_not receive(:redirect_to).with(root_path)
        subject.send(:authenticate_admin_user!)
      end
    end
  end

  describe 'current_admin_user' do
    context 'without a logged in user' do
      before do
        expect(subject).to receive(:current_user).at_least(:once).and_return nil
      end

      it 'redirects to root path' do
        response = subject.send(:current_admin_user)
        expect(response).to be_nil
      end
    end

    context 'with a logged in user' do
      before do
        expect(subject).to receive(:current_user).at_least(:once).and_return user
      end

      it 'redirects to root path' do
        response = subject.send(:current_admin_user)
        expect(response).to be_nil
      end
    end

    context 'with a logged in admin' do
      let(:admin_user) { User.new(email: 'test@test.com', password: '123456', admin: true) }

      before do
        expect(subject).to receive(:current_user).at_least(:once).and_return admin_user
      end

      it 'redirects to root path' do
        response = subject.send(:current_admin_user)
        expect(response).to eq(admin_user)
      end
    end
  end
end

